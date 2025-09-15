import React, { useMemo, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subMonths } from 'date-fns'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthProvider'
import Container from '../components/ui/Container'
import Icon from '../components/icons/Icon'

interface AppSale {
  id: string
  sale_price: number
  sale_date: string | null
  artwork_id: string
  digital_coa_url?: string | null
  collector_id: string
  artworks: { title: string | null; image_url: string | null }
  collector?: { id: string; full_name: string | null }
}

interface MonthlyRevenue { month_name: string; total_revenue: number }

interface CollectorSale {
  id: string
  artwork: {
    id: string
    title: string
    primary_image_url: string
    price: number
    currency: string
    medium: string
    year: number
  }
  artist: {
    name: string
    slug: string
  }
  purchased_at: string
  purchase_price: number
  status: string
  shipping_address: any
  payment_method: string
  transaction_id: string
}

const fetchSalesData = async (artistId: string): Promise<AppSale[]> => {
  const { data, error } = await supabase
    .from('sales')
    .select(`*, digital_coa_url, artworks ( id, title, artwork_images(image_url, is_primary, position) ), collector:profiles!sales_collector_id_fkey ( id, full_name )`)
    .eq('artist_id', artistId)
    .order('sale_date', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as any).map((sale: any) => ({
    ...sale,
    artworks: {
      title: sale.artworks?.title ?? null,
      image_url: sale.artworks?.artwork_images?.find((i: any) => i.is_primary)?.image_url || sale.artworks?.artwork_images?.[0]?.image_url || null,
    }
  }))
}

const fetchMonthlyRevenue = async (artistId: string): Promise<MonthlyRevenue[]> => {
  const { data, error } = await supabase.rpc('get_monthly_sales_revenue', { p_artist_id: artistId })
  if (error) throw new Error(error.message)
  return data || []
}

const fetchCollectorSales = async (userId: string): Promise<CollectorSale[]> => {
  const { data, error } = await supabase
    .from('user_collection')
    .select(`
      id, purchased_at, purchase_price, status, shipping_address, payment_method, transaction_id,
      artworks!inner(
        id, title, primary_image_url, price, currency, medium, year,
        profiles!artworks_user_id_fkey(
          full_name, slug
        )
      )
    `)
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false })

  if (error) throw new Error(error.message)
  
  return (data || []).map(sale => ({
    id: sale.id,
    artwork: {
      id: sale.artworks.id,
      title: sale.artworks.title || 'Untitled',
      primary_image_url: sale.artworks.primary_image_url || '',
      price: sale.artworks.price || 0,
      currency: sale.artworks.currency || 'USD',
      medium: sale.artworks.medium || '',
      year: sale.artworks.year || new Date().getFullYear()
    },
    artist: {
      name: sale.artworks.profiles?.full_name || 'Unknown Artist',
      slug: sale.artworks.profiles?.slug || ''
    },
    purchased_at: sale.purchased_at,
    purchase_price: sale.purchase_price || 0,
    status: sale.status,
    shipping_address: sale.shipping_address,
    payment_method: sale.payment_method || '',
    transaction_id: sale.transaction_id || ''
  }))
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-card border border-border rounded-md shadow-lg">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-muted-foreground">Revenue: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function SalesPage() {
  const { user, profile } = useAuth()
  const [dateRange, setDateRange] = useState({ from: format(subMonths(new Date(), 1), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') })
  const [collectorFilter, setCollectorFilter] = useState<'all' | 'purchased' | 'shipped' | 'delivered'>('all')

  const isArtist = profile?.role === 'ARTIST'
  const isCollector = profile?.role === 'COLLECTOR'

  // Artist sales data
  const { data: artistSales = [], isLoading: isLoadingArtistSales } = useQuery<AppSale[], Error>({ 
    queryKey: ['artist-sales', user?.id], 
    queryFn: () => fetchSalesData(user!.id), 
    enabled: !!user && isArtist 
  })
  
  const { data: monthlyRevenue = [], isLoading: isLoadingChart } = useQuery<MonthlyRevenue[], Error>({ 
    queryKey: ['monthlyRevenue', user?.id], 
    queryFn: () => fetchMonthlyRevenue(user!.id), 
    enabled: !!user && isArtist 
  })

  // Collector sales data
  const { data: collectorSales = [], isLoading: isLoadingCollectorSales } = useQuery<CollectorSale[], Error>({ 
    queryKey: ['collector-sales', user?.id, collectorFilter], 
    queryFn: () => fetchCollectorSales(user!.id), 
    enabled: !!user && isCollector 
  })

  const filteredArtistSales = useMemo(() => {
    if (!artistSales) return []
    try {
      const fromDate = new Date(dateRange.from)
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)
      return artistSales.filter(sale => {
        const saleDate = sale.sale_date ? new Date(sale.sale_date) : new Date(0)
        return saleDate >= fromDate && saleDate <= toDate
      })
    } catch { return artistSales }
  }, [artistSales, dateRange])

  const filteredCollectorSales = useMemo(() => {
    if (!collectorSales) return []
    if (collectorFilter === 'all') return collectorSales
    return collectorSales.filter(sale => sale.status === collectorFilter)
  }, [collectorSales, collectorFilter])

  const artistStats = useMemo(() => {
    if (!artistSales) return { totalRevenue: 0, totalSales: 0, uniqueCollectors: 0, averageSalePrice: 0 }
    const totalRevenue = artistSales.reduce((acc, s) => acc + (s.sale_price ?? 0), 0)
    const uniqueCollectors = new Set(artistSales.map(s => s.collector_id)).size
    const totalSales = artistSales.length
    const averageSalePrice = totalSales > 0 ? totalRevenue / totalSales : 0
    return { totalRevenue, totalSales, uniqueCollectors, averageSalePrice }
  }, [artistSales])

  const collectorStats = useMemo(() => {
    if (!collectorSales) return { totalSpent: 0, totalPurchases: 0, averagePrice: 0 }
    const totalSpent = collectorSales.reduce((acc, s) => acc + (s.purchase_price ?? 0), 0)
    const totalPurchases = collectorSales.length
    const averagePrice = totalPurchases > 0 ? totalSpent / totalPurchases : 0
    return { totalSpent, totalPurchases, averagePrice }
  }, [collectorSales])

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const handleExport = () => {
    if (isArtist) {
      if (!filteredArtistSales || filteredArtistSales.length === 0) { 
        toast.error('No data to export for the selected range.'); 
        return 
      }
      const headers = ['Artwork Title','Date Sold','Collector Name','Sale Price (USD)','CoA URL']
      const rows = filteredArtistSales.map(s => [
        JSON.stringify(s.artworks.title || ''), 
        s.sale_date ? new Date(s.sale_date).toLocaleDateString() : '', 
        JSON.stringify(s.collector?.full_name || 'N/A'), 
        s.sale_price, 
        (s as any).digital_coa_url || 'Physical'
      ])
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a'); const url = URL.createObjectURL(blob)
      link.setAttribute('href', url); link.setAttribute('download', `sales_report_${dateRange.from}_to_${dateRange.to}.csv`)
      document.body.appendChild(link); link.click(); document.body.removeChild(link)
      toast.success('Sales report downloaded!')
    } else if (isCollector) {
      if (!filteredCollectorSales || filteredCollectorSales.length === 0) { 
        toast.error('No purchases to export.'); 
        return 
      }
      const headers = ['Artwork Title','Artist','Purchase Date','Price','Status','Transaction ID']
      const rows = filteredCollectorSales.map(s => [
        JSON.stringify(s.artwork.title), 
        JSON.stringify(s.artist.name),
        new Date(s.purchased_at).toLocaleDateString(),
        s.purchase_price,
        s.status,
        s.transaction_id
      ])
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a'); const url = URL.createObjectURL(blob)
      link.setAttribute('href', url); link.setAttribute('download', `purchase_history_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link); link.click(); document.body.removeChild(link)
      toast.success('Purchase history downloaded!')
    }
  }

  if (!user) {
    return (
      <Container>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Please log in to view sales</h1>
          <p className="text-muted-foreground">You need to be logged in to access this page.</p>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="sales-page">
        {isArtist ? (
          <>
            <div className="sales-header">
              <h1 className="sales-title">Sales Overview</h1>
              <p className="sales-subtitle">Track your artwork sales and revenue performance.</p>
            </div>

            <div className="kpi-grid mb-8">
              <Stat title="Total Revenue" value={formatCurrency(artistStats.totalRevenue)} />
              <Stat title="Artworks Sold" value={String(artistStats.totalSales)} />
              <Stat title="Unique Collectors" value={String(artistStats.uniqueCollectors)} />
              <Stat title="Avg. Sale Price" value={formatCurrency(artistStats.averageSalePrice)} />
            </div>

            <div className="dashboard-section">
              <h3 className="section-title">Sales Trends (Last 12 Months)</h3>
              {isLoadingChart ? <p className="loading-message">Loading chart...</p> : monthlyRevenue.length > 0 ? (
                <div className="w-full h-72 bg-card p-4 rounded-md border border-border">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenue} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="month_name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v as number / 1000)}k`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent-subtle)' }} />
                      <Bar dataKey="total_revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="empty-state-message">No sales data in the last year to display trends.</p>}
            </div>

            <div className="dashboard-section mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="section-title">Sales History</h3>
                <div className="flex items-center gap-4">
                  <input type="date" className="input" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} />
                  <span className="text-muted-foreground">to</span>
                  <input type="date" className="input" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} />
                  <button onClick={handleExport} className="btn btn-secondary">
                    <Icon name="download" size={16} />
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="card-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Artwork</th>
                      <th>Date Sold</th>
                      <th>Collector</th>
                      <th className="text-right">Sale Price</th>
                      <th className="text-center">Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                  {isLoadingArtistSales ? (
                    <tr><td colSpan={5} className="text-center py-8 loading-message">Loading sales data...</td></tr>
                  ) : filteredArtistSales.length > 0 ? (
                    filteredArtistSales.map(sale => (
                      <tr key={sale.id}>
                        <td>
                          <Link to={`/u/artworks/edit/${sale.artwork_id}`} className="flex items-center gap-4 text-link">
                            <img src={sale.artworks.image_url || ''} alt={sale.artworks.title || 'Artwork'} className="table-thumbnail" />
                            <span>{sale.artworks.title}</span>
                          </Link>
                        </td>
                        <td>{sale.sale_date ? new Date(sale.sale_date).toLocaleDateString() : 'N/A'}</td>
                        <td>{sale.collector?.full_name || 'N/A'}</td>
                        <td className="text-right font-semibold">{formatCurrency(sale.sale_price)}</td>
                        <td className="text-center">{sale.digital_coa_url ? <a href={sale.digital_coa_url} target="_blank" rel="noopener noreferrer">View</a> : <span className="text-xs text-muted-foreground italic">Physical CoA</span>}</td>
                      </tr>
                    ))
                  ) : <tr><td colSpan={5} className="text-center py-8 empty-state-message">No sales found in this date range.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : isCollector ? (
          <>
            <div className="sales-header">
              <h1 className="sales-title">Purchase History</h1>
              <p className="sales-subtitle">Track your artwork purchases and collection.</p>
            </div>

            <div className="kpi-grid mb-8">
              <Stat title="Total Spent" value={formatCurrency(collectorStats.totalSpent)} />
              <Stat title="Artworks Purchased" value={String(collectorStats.totalPurchases)} />
              <Stat title="Average Price" value={formatCurrency(collectorStats.averagePrice)} />
              <Stat title="Status Filter" value={collectorFilter} />
            </div>

            <div className="dashboard-section mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="section-title">Purchase History</h3>
                <div className="flex items-center gap-4">
                  <select 
                    value={collectorFilter} 
                    onChange={e => setCollectorFilter(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="all">All Status</option>
                    <option value="purchased">Purchased</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <button onClick={handleExport} className="btn btn-secondary">
                    <Icon name="download" size={16} />
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="card-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Artwork</th>
                      <th>Artist</th>
                      <th>Purchase Date</th>
                      <th className="text-right">Price</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                  {isLoadingCollectorSales ? (
                    <tr><td colSpan={5} className="text-center py-8 loading-message">Loading purchase data...</td></tr>
                  ) : filteredCollectorSales.length > 0 ? (
                    filteredCollectorSales.map(sale => (
                      <tr key={sale.id}>
                        <td>
                          <Link to={`/artwork/${sale.artwork.id}`} className="flex items-center gap-4 text-link">
                            <img src={sale.artwork.primary_image_url || ''} alt={sale.artwork.title} className="table-thumbnail" />
                            <span>{sale.artwork.title}</span>
                          </Link>
                        </td>
                        <td>
                          <Link to={`/artist/${sale.artist.slug}`} className="text-link">
                            {sale.artist.name}
                          </Link>
                        </td>
                        <td>{new Date(sale.purchased_at).toLocaleDateString()}</td>
                        <td className="text-right font-semibold">{formatCurrency(sale.purchase_price)}</td>
                        <td className="text-center">
                          <span className={`status-badge status-${sale.status}`}>
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : <tr><td colSpan={5} className="text-center py-8 empty-state-message">No purchases found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Role Not Recognized</h1>
            <p className="text-muted-foreground">Please contact support if you believe this is an error.</p>
          </div>
        )}
      </div>
    </Container>
  )
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="stat-card">
      <div>
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </div>
  )
}


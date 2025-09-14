import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import Container from '../../components/ui/Container'
import { showErrorToast } from '../../utils/errorHandling'
import Icon from '../../components/icons/Icon'

interface Sale {
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

const SalesPage: React.FC = () => {
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'purchased' | 'shipped' | 'delivered'>('all')

  useEffect(() => {
    if (user) {
      loadSales()
    }
  }, [user, filter])

  const loadSales = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('user_collection')
        .select(`
          id, purchased_at, purchase_price, status, shipping_address, payment_method, transaction_id,
          artworks!inner(
            id, title, primary_image_url, price, currency, medium, year,
            profiles!artworks_user_id_fkey(
              display_name, slug
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('purchased_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      const processedSales: Sale[] = (data || []).map(sale => ({
        id: sale.id,
        artwork: {
          id: sale.artworks.id,
          title: sale.artworks.title || 'Untitled',
          primary_image_url: sale.artworks.primary_image_url || '',
          price: sale.artworks.price || 0,
          currency: sale.artworks.currency || 'ZAR',
          medium: sale.artworks.medium || '',
          year: sale.artworks.year || new Date().getFullYear()
        },
        artist: {
          name: sale.artworks.profiles?.display_name || 'Unknown Artist',
          slug: sale.artworks.profiles?.slug || ''
        },
        purchased_at: sale.purchased_at,
        purchase_price: sale.purchase_price || 0,
        status: sale.status,
        shipping_address: sale.shipping_address,
        payment_method: sale.payment_method || '',
        transaction_id: sale.transaction_id || ''
      }))

      setSales(processedSales)
    } catch (error) {
      console.error('Error loading sales:', error)
      showErrorToast('Failed to load sales history')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'purchased': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-yellow-100 text-yellow-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'returned': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'purchased': return 'shopping-bag'
      case 'shipped': return 'truck'
      case 'delivered': return 'check-circle'
      case 'returned': return 'arrow-left'
      default: return 'package'
    }
  }

  const totalSpent = sales.reduce((sum, sale) => sum + sale.purchase_price, 0)
  const totalItems = sales.length

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Helmet>
        <title>Sales History | ArtFlow</title>
      </Helmet>

      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
          <p className="text-gray-600 mt-2">Track your art purchases and collection</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon name="shopping-bag" size={24} color="#10b981" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon name="dollar-sign" size={24} color="#3b82f6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(totalSpent, 'ZAR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon name="trending-up" size={24} color="#8b5cf6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalItems > 0 ? formatPrice(totalSpent / totalItems, 'ZAR') : 'R0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex space-x-1">
            {[
              { id: 'all', label: 'All Purchases' },
              { id: 'purchased', label: 'Purchased' },
              { id: 'shipped', label: 'Shipped' },
              { id: 'delivered', label: 'Delivered' }
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === filterOption.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sales List */}
        {sales.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="shopping-bag" size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
            <p className="text-gray-600 mb-6">Start building your collection by exploring artworks</p>
            <a
              href="/explore"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Icon name="search" size={20} className="mr-2" />
              Explore Artworks
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div key={sale.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={sale.artwork.primary_image_url || '/placeholder-artwork.jpg'}
                    alt={sale.artwork.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{sale.artwork.title}</h3>
                        <p className="text-sm text-gray-600">{sale.artist.name}</p>
                        <p className="text-sm text-gray-500">{sale.artwork.medium} • {sale.artwork.year}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(sale.purchase_price, sale.artwork.currency)}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(sale.status)}`}>
                            <Icon name={getStatusIcon(sale.status)} size={12} className="inline mr-1" />
                            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Purchase Date:</span>
                        <p>{formatDate(sale.purchased_at)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Payment Method:</span>
                        <p>{sale.payment_method || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Transaction ID:</span>
                        <p className="font-mono text-xs">{sale.transaction_id || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export default SalesPage

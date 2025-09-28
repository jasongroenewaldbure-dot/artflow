import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthProvider'
import Container from "../../brush/components/forms/Container"
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling'
import Icon from "../../brush/Icon"

interface Conversation {
  id: string
  artwork: {
    id: string
    title: string
    primary_image_url: string
    price: number
    currency: string
  }
  artist: {
    id: string
    display_name: string
    avatar_url?: string | null
  }
  status: string
  last_message_at: string
  last_message_preview: string
  artist_unread: boolean
  inquirer_unread: boolean
  created_at: string
}

interface Message {
  id: string
  content: string
  sender_id: string | null
  created_at: string
  is_read: boolean
}

const MessagesPage: React.FC = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id, status, last_message_at, last_message_preview, artist_unread, inquirer_unread, created_at,
          artworks!inner(
            id, title, primary_image_url, price, currency
          ),
          profiles!conversations_artist_id_fkey(
            id, display_name, avatar_url
          )
        `)
        .eq('inquirer_user_id', user?.id)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      const processedConversations: Conversation[] = (data || []).map(conv => {
        const artwork = conv.artworks?.[0] || conv.artworks
        const profile = conv.profiles?.[0] || conv.profiles
        return {
          id: conv.id,
          artwork: {
            id: artwork?.id || 'unknown',
            title: artwork?.title || 'Untitled',
            primary_image_url: artwork?.primary_image_url || '',
            price: artwork?.price || 0,
            currency: artwork?.currency || 'ZAR'
          },
          artist: {
            id: profile?.id || 'unknown',
            display_name: profile?.display_name || 'Unknown Artist',
            avatar_url: profile?.avatar_url as string | null
          },
          status: conv.status,
          last_message_at: conv.last_message_at,
          last_message_preview: conv.last_message_preview || '',
          artist_unread: conv.artist_unread,
          inquirer_unread: conv.inquirer_unread,
          created_at: conv.created_at
        }
      })

      setConversations(processedConversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
      showErrorToast('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, sender_id, created_at, is_read')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
      showErrorToast('Failed to load messages')
    }
  }

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || sending) return

    try {
      setSending(true)

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user?.id,
          content: newMessage.trim()
        })

      if (error) throw error

      setNewMessage('')
      loadMessages(selectedConversation.id)
      loadConversations() // Refresh conversations to update last message
      showSuccessToast('Message sent')
    } catch (error) {
      console.error('Error sending message:', error)
      showErrorToast('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-ZA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-ZA', { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else {
      return date.toLocaleDateString('en-ZA', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Container>
      <Helmet>
        <title>Messages | ArtFlow</title>
      </Helmet>

      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">Communicate with artists about artworks</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="message-square" size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-600 mb-6">Start a conversation by inquiring about an artwork</p>
            <Link
              to="/explore"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Icon name="search" size={20} className="mr-2" />
              Explore Artworks
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={conversation.artwork.primary_image_url || '/placeholder-artwork.jpg'}
                          alt={conversation.artwork.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {conversation.artist.display_name}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(conversation.status)}`}>
                              {conversation.status}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {conversation.artwork.title}
                          </p>
                          
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {conversation.last_message_preview || 'No messages yet'}
                          </p>
                          
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(conversation.last_message_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 flex flex-col">
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedConversation.artwork.primary_image_url || '/placeholder-artwork.jpg'}
                        alt={selectedConversation.artwork.title}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.artist.display_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedConversation.artwork.title} • {formatPrice(selectedConversation.artwork.price, selectedConversation.artwork.currency)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={sending}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Icon name="send" size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Icon name="message-square" size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export default MessagesPage

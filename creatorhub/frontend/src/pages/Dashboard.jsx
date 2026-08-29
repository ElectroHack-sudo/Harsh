import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Eye, Heart, MessageCircle, Share2, Plus, Play } from 'lucide-react';

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, contentRes] = await Promise.all([
        axios.get('/api/analytics/dashboard'),
        axios.get('/api/content?limit=5')
      ]);
      setAnalytics(analyticsRes.data.dashboard);
      setRecentContent(contentRes.data.content || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  const stats = analytics?.overview || {
    total_followers: 25400,
    total_views: 1200000,
    total_likes: 84500,
    total_comments: 12300,
    total_shares: 8900
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const statCards = [
    { label: 'Followers', value: stats.total_followers, icon: Users, color: '#7c3aed' },
    { label: 'Views', value: stats.total_views, icon: Eye, color: '#0ea5e9' },
    { label: 'Likes', value: stats.total_likes, icon: Heart, color: '#ef4444' },
    { label: 'Comments', value: stats.total_comments, icon: MessageCircle, color: '#10b981' },
    { label: 'Shares', value: stats.total_shares, icon: Share2, color: '#f59e0b' }
  ];

  const growthData = [
    { name: 'Jan', followers: 15000, views: 500000 },
    { name: 'Feb', followers: 17000, views: 600000 },
    { name: 'Mar', followers: 19000, views: 700000 },
    { name: 'Apr', followers: 21000, views: 850000 },
    { name: 'May', followers: 23000, views: 950000 },
    { name: 'Jun', followers: 25000, views: 1100000 },
    { name: 'Jul', followers: 25400, views: 1200000 }
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <a href="/create" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
          <Plus size={20} />
          Create New Content
        </a>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: `${stat.color}15`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1f2937' }}>
                {formatNumber(stat.value)}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <TrendingUp size={20} style={{ color: '#7c3aed' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
            Account Growth
          </h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="followers" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed' }} />
            <Line type="monotone" dataKey="views" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
      }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          Recent Content
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          {recentContent.length > 0 ? recentContent.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#f3f4f6',
                borderRadius: '8px',
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {item.thumbnail_url ? (
                <img src={item.thumbnail_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Play size={32} style={{ color: '#6b7280' }} />
              )}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '0.5rem',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {item.title || 'Untitled'}
              </div>
            </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              No content yet. Create your first post!
            </div>
          )}
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
      }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
          Platform Performance
        </h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {analytics?.platforms?.map((platform) => (
            <div
              key={platform.platform}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: platform.platform === 'youtube' ? '#ff0000' :
                    platform.platform === 'instagram' ? '#e4405f' : '#1877f2',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '0.75rem'
                }}>
                  {platform.platform.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: '600', color: '#1f2937', textTransform: 'capitalize' }}>
                    {platform.platform}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {formatNumber(platform.followers)} followers
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {formatNumber(platform.views)} views
                </p>
                <p style={{ fontSize: '0.75rem', color: '#10b981' }}>
                  {platform.engagement_rate}% engagement
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TagFilter from './components/TagFilter';
import KanbanBoard from './components/KanbanBoard';
import ListView from './components/ListView';
import LeadModal from './components/LeadModal';
import BotConfigModal from './components/BotConfigModal';
import { Search } from 'lucide-react';

export default function App() {
  const [leads, setLeads] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'list' | 'doc'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState(null);
  const [isBotConfigModalOpen, setIsBotConfigModalOpen] = useState(false);

  // Bot Status
  const [botStatus, setBotStatus] = useState({ active: false, hasToken: false });

  // Initial Fetch
  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      const data = await res.json();
      setTags(data.tags || []);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  const fetchBotStatus = async () => {
    try {
      const res = await fetch('/api/bot-status');
      const data = await res.json();
      setBotStatus(data);
    } catch (err) {
      console.error('Failed to fetch bot status:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchTags();
    fetchBotStatus();

    // Subscribe to Real-Time SSE Events
    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('lead_created', (e) => {
      const newLead = JSON.parse(e.data);
      setLeads(prev => [newLead, ...prev.filter(l => l.id !== newLead.id)]);
      fetchTags();
    });

    eventSource.addEventListener('lead_updated', (e) => {
      const updatedLead = JSON.parse(e.data);
      setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
      fetchTags();
    });

    eventSource.addEventListener('lead_deleted', (e) => {
      const { id } = JSON.parse(e.data);
      setLeads(prev => prev.filter(l => l.id !== id));
      fetchTags();
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    if (selectedTag && (!lead.tags || !lead.tags.includes(selectedTag))) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.name && lead.name.toLowerCase().includes(q);
      const matchContact = lead.contact && lead.contact.toLowerCase().includes(q);
      const matchReq = lead.request && lead.request.toLowerCase().includes(q);
      const matchNotes = lead.notes && lead.notes.toLowerCase().includes(q);
      if (!matchName && !matchContact && !matchReq && !matchNotes) {
        return false;
      }
    }
    return true;
  });

  // Actions
  const handleSaveLead = async (formData) => {
    try {
      if (selectedLeadForEdit) {
        // Update existing lead
        const res = await fetch(`/api/leads/${selectedLeadForEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const updated = await res.json();
          setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
        }
      } else {
        // Create new lead manually
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const created = await res.json();
          setLeads(prev => [created, ...prev]);
        }
      }
      setIsAddModalOpen(false);
      setSelectedLeadForEdit(null);
      fetchTags();
    } catch (err) {
      console.error('Error saving lead:', err);
    }
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Вы действительно хотите удалить этого лида?')) return;
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
        if (selectedLeadForEdit && selectedLeadForEdit.id === leadId) {
          setSelectedLeadForEdit(null);
          setIsAddModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setSelectedLeadForEdit(null);
          setIsAddModalOpen(true);
        }}
        onOpenBotConfigModal={() => setIsBotConfigModalOpen(true)}
        botStatus={botStatus}
        leadsCount={leads.length}
        onRefresh={fetchLeads}
      />

      {/* Main View Area */}
      <main className="main-content">
        <>
          {/* Search and Tag Filtering Toolbar */}
            <div className="toolbar">
              <div className="search-box">
                <Search className="search-icon w-4 h-4" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Поиск по имени, контакту или описанию запроса..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="text-xs text-gray-400">
                Отображено лидов: <span className="font-bold text-white">{filteredLeads.length}</span> из {leads.length}
              </div>
            </div>

            {/* Tag filter chips bar (Point 4) */}
            <TagFilter
              tags={tags}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
              leads={leads}
            />

            {/* Active View: Kanban or List */}
            {activeTab === 'kanban' ? (
              <KanbanBoard
                leads={filteredLeads}
                onSelectLead={(lead) => {
                  setSelectedLeadForEdit(lead);
                  setIsAddModalOpen(true);
                }}
                onUpdateStatus={handleUpdateStatus}
              />
            ) : (
              <ListView
                leads={filteredLeads}
                onSelectLead={(lead) => {
                  setSelectedLeadForEdit(lead);
                  setIsAddModalOpen(true);
                }}
                onDeleteLead={handleDeleteLead}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
        </>
      </main>

      {/* Add / Edit Lead Modal (Point 3 & 4) */}
      {(isAddModalOpen || selectedLeadForEdit) && (
        <LeadModal
          lead={selectedLeadForEdit}
          availableTags={tags}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedLeadForEdit(null);
          }}
          onSave={handleSaveLead}
          onDelete={selectedLeadForEdit ? () => handleDeleteLead(selectedLeadForEdit.id) : null}
        />
      )}

      {/* Telegram Bot Config & Instructions Modal */}
      {isBotConfigModalOpen && (
        <BotConfigModal
          botStatus={botStatus}
          onClose={() => setIsBotConfigModalOpen(false)}
        />
      )}
    </div>
  );
}

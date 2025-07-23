import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useApp } from "@/context/AppContext";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Lock, Plus, Edit, Trash2, Eye, EyeOff, Search, Key, Shield, AlertTriangle, ArrowLeft } from 'lucide-react';

const xorCrypt = (str, key) => {
  return str.split('').map((char, i) => {
    return String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length));
  }).join('');
};

export default function PasswordVault() {
  const { state, dispatch } = useApp();
  const { vaultEntries } = state;
  
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [decryptedPasswords, setDecryptedPasswords] = useState({});
  const [error, setError] = useState('');
  
  const handleUnlock = () => {
    if (!masterPassword) {
      setError("Please enter your master password.");
      return;
    }
    setError('');
    setIsUnlocked(true);
  };

  const handleSave = () => {
    if (!currentEntry?.service_name || !currentEntry?.username) {
        alert("Service Name and Username/Email are required.");
        return;
    }

    if (!isEditing && !currentEntry?.password) {
        alert("Password is required for new entries.");
        return;
    }
    
    let passwordToEncrypt = currentEntry.password;
    if (isEditing && !passwordToEncrypt) {
      passwordToEncrypt = null;
    }

    const dataToSave = { ...currentEntry };
    
    if (passwordToEncrypt) {
        dataToSave.encrypted_password = xorCrypt(passwordToEncrypt, masterPassword);
    } else if (isEditing && !currentEntry.encrypted_password) {
        alert("No password provided and no existing encrypted password found.");
        return;
    }
    
    delete dataToSave.password;

    if (isEditing) {
      dispatch({
        type: 'UPDATE_VAULT_ENTRY',
        payload: { id: currentEntry.id, updates: dataToSave }
      });
    } else {
      dispatch({
        type: 'ADD_VAULT_ENTRY',
        payload: dataToSave
      });
    }
    
    setShowDialog(false);
    setCurrentEntry(null);
    setDecryptedPasswords({});
    setError('');
  };
  
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this vault entry? This action cannot be undone.")) {
      dispatch({
        type: 'DELETE_VAULT_ENTRY',
        payload: { id }
      });
      setDecryptedPasswords(prev => {
          const newDecrypted = { ...prev };
          delete newDecrypted[id];
          return newDecrypted;
      });
    }
  };
  
  const toggleDecryption = (id, encryptedPass) => {
    if (!masterPassword || masterPassword.length === 0) {
      alert("Master password is required to decrypt passwords.");
      return;
    }
    setDecryptedPasswords(prev => ({
      ...prev,
      [id]: prev[id] ? null : xorCrypt(encryptedPass, masterPassword)
    }));
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-6 bg-white shadow-lg rounded-lg">
        <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4"/>
        <h1 className="text-2xl font-bold text-gray-800">Password Vault</h1>
        <p className="text-gray-600 mb-6">Enter your master password to unlock.</p>
        <Input 
          type="password" 
          value={masterPassword} 
          onChange={e => setMasterPassword(e.target.value)} 
          placeholder="Master Password" 
          className="mb-4"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleUnlock();
            }
          }}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <Button onClick={handleUnlock} className="w-full">Unlock</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Features")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Password Vault</h1>
            <p className="text-gray-600 mt-1">Securely store and manage your login credentials.</p>
          </div>
        </div>
        
        <Dialog open={showDialog} onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) {
                setCurrentEntry(null);
                setIsEditing(false);
            }
        }}>
            <DialogTrigger asChild>
                <Button onClick={() => { setIsEditing(false); setCurrentEntry({}); }}><Plus className="w-4 h-4 mr-2" />Add Entry</Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader><DialogTitle>{isEditing ? 'Edit' : 'Add'} Vault Entry</DialogTitle></DialogHeader>
            <div className="space-y-4">
                <div><Label htmlFor="service-name">Service Name</Label><Input id="service-name" value={currentEntry?.service_name || ''} onChange={e => setCurrentEntry({...currentEntry, service_name: e.target.value})} placeholder="e.g., Google, Amazon" /></div>
                <div><Label htmlFor="username">Username/Email</Label><Input id="username" value={currentEntry?.username || ''} onChange={e => setCurrentEntry({...currentEntry, username: e.target.value})} placeholder="e.g., myemail@example.com" /></div>
                <div><Label htmlFor="password">Password</Label><Input type="text" id="password" value={currentEntry?.password || ''} onChange={e => setCurrentEntry({...currentEntry, password: e.target.value})} placeholder={isEditing ? 'Enter new password to change' : 'Required for new entries'} /></div>
                <div><Label htmlFor="notes">Notes</Label><Input id="notes" value={currentEntry?.notes || ''} onChange={e => setCurrentEntry({...currentEntry, notes: e.target.value})} placeholder="Any additional notes" /></div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </div>
            </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4 flex items-center gap-4 text-yellow-700">
          <AlertTriangle className="w-8 h-8"/>
          <div>
            <h3 className="font-bold">Security Warning</h3>
            <p className="text-sm">This is a demo feature. The password "encryption" is not secure. Do not store real passwords here.</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vaultEntries.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 mt-8">No vault entries yet. Click "Add Entry" to get started!</p>
        ) : (
          vaultEntries.map(entry => (
            <Card key={entry.id}>
              <CardHeader><CardTitle>{entry.service_name}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{entry.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Input 
                    type="text" 
                    readOnly 
                    value={decryptedPasswords[entry.id] || '••••••••••'}
                    className="font-mono text-sm"
                  />
                  <Button variant="ghost" size="icon" onClick={() => toggleDecryption(entry.id, entry.encrypted_password)}>
                    {decryptedPasswords[entry.id] ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </Button>
                </div>
              </CardContent>
              <div className="p-4 flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { 
                      setIsEditing(true); 
                      setCurrentEntry({ ...entry, password: '' }); 
                      setShowDialog(true); 
                  }}><Edit className="w-4 h-4"/></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
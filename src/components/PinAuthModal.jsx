import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Lock, Unlock, X } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import bcrypt from 'bcryptjs';

const PinAuthModal = ({ isOpen, onClose, onSuccess, hasExistingPin, user, isDarkTheme }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(!hasExistingPin);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setConfirmPin('');
      setError('');
      setIsCreating(!hasExistingPin);
    }
  }, [isOpen, hasExistingPin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isCreating) {
        // Creating new PIN
        if (pin.length < 4 || pin.length > 6) {
          setError('PIN must be 4-6 digits');
          setLoading(false);
          return;
        }

        if (pin !== confirmPin) {
          setError('PINs do not match');
          setLoading(false);
          return;
        }

        if (!/^\d+$/.test(pin)) {
          setError('PIN must contain only numbers');
          setLoading(false);
          return;
        }

        // Hash the PIN
        const saltRounds = 12;
        const pinHash = await bcrypt.hash(pin, saltRounds);

        // Save to database
        const { error: dbError } = await supabase
          .from('my_desk_settings')
          .upsert({
            user_id: user.id,
            pin_hash: pinHash,
            last_checklist_reset: new Date().toISOString().split('T')[0]
          });

        if (dbError) throw dbError;

        onSuccess();
      } else {
        // Verifying existing PIN
        if (pin.length < 4 || pin.length > 6) {
          setError('Please enter your PIN');
          setLoading(false);
          return;
        }

        // Get stored PIN hash
        const { data: settings, error: fetchError } = await supabase
          .from('my_desk_settings')
          .select('pin_hash')
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;

        // Verify PIN
        const isValid = await bcrypt.compare(pin, settings.pin_hash);

        if (!isValid) {
          setError('Incorrect PIN');
          setLoading(false);
          return;
        }

        onSuccess();
      }
    } catch (error) {
      console.error('PIN operation error:', error);
      setError('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setIsCreating(!isCreating);
    setPin('');
    setConfirmPin('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-lg p-6 ${isDarkTheme ? 'bg-[#424250] text-white' : 'bg-[#f3f4fd] text-gray-900'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-[#8a87d6]" />
            <h2 className="text-xl font-semibold">
              {isCreating ? 'Set Up PIN' : 'Enter PIN'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-md hover:bg-[#f3f4fd] dark:hover:bg-[#424250] transition-colors ${isDarkTheme ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <div className={`mb-6 text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
          {isCreating ? (
            <p>
              Create a 4-6 digit PIN to secure your My Desk workspace. This PIN will be required 
              each time you open My Desk.
            </p>
          ) : (
            <p>
              Enter your PIN to access your personal My Desk workspace.
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PIN Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              {isCreating ? 'Create PIN (4-6 digits)' : 'Enter PIN'}
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={isCreating ? 'Enter 4-6 digits' : 'Your PIN'}
                className={`w-full px-3 py-2 pr-10 border rounded-md text-center text-lg tracking-widest ${
                  isDarkTheme
                    ? 'bg-[#424250] border-gray-600 text-white placeholder-gray-400 focus:border-[#8a87d6]'
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8a87d6]'
                } focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-opacity-20`}
                maxLength={6}
                autoComplete="off"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkTheme ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm PIN (only when creating) */}
          {isCreating && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirm PIN
              </label>
              <input
                type={showPin ? 'text' : 'password'}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Confirm your PIN"
                className={`w-full px-3 py-2 border rounded-md text-center text-lg tracking-widest ${
                  isDarkTheme
                    ? 'bg-[#424250] border-gray-600 text-white placeholder-gray-400 focus:border-[#8a87d6]'
                    : 'bg-[#f3f4fd] border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#8a87d6]'
                } focus:outline-none focus:ring-2 focus:ring-[#8a87d6] focus:ring-opacity-20`}
                maxLength={6}
                autoComplete="off"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-[#e69a96] text-sm bg-[#e69a96] dark:bg-[#e69a96]/20 border border-[#e69a96] dark:border-[#e69a96] rounded-md p-3">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (isCreating ? (pin.length < 4 || confirmPin.length < 4) : pin.length < 4)}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              loading || (isCreating ? (pin.length < 4 || confirmPin.length < 4) : pin.length < 4)
                ? isDarkTheme
                  ? 'bg-[#424250] text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#8a87d6] hover:bg-[#8a87d6] text-white'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isCreating ? 'Creating...' : 'Verifying...'}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                {isCreating ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span>{isCreating ? 'Create PIN' : 'Unlock'}</span>
              </div>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        {hasExistingPin && (
          <div className="mt-4 text-center">
            <button
              onClick={toggleMode}
              className={`text-sm underline ${isDarkTheme ? 'text-[#8a87d6] hover:text-[#8a87d6]' : 'text-[#8a87d6] hover:text-[#8a87d6]'}`}
            >
              {isCreating ? 'I already have a PIN' : 'Reset PIN'}
            </button>
          </div>
        )}

        {/* Security Notice */}
        <div className={`mt-4 text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>
            🔒 Your PIN is encrypted and stored securely. It expires when you close the app.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PinAuthModal;


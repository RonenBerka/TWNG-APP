import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shield, Camera, Instagram, FileText, CheckCircle, AlertCircle, ArrowLeft, Upload, Hash, Sparkles } from 'lucide-react';
import { T } from '../theme/tokens';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase/client';
import { submitClaim, hasPendingClaim } from '../lib/supabase/claims';

export default function ClaimGuitar() {
  const { guitarId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // State
  const [step, setStep] = useState(1); // 1: Preview, 2: Evidence, 3: Confirmation
  const [guitar, setGuitar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimId, setClaimId] = useState(null);

  // Step 2 state
  const [verificationType, setVerificationType] = useState('instagram_match');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [serialPhotoUrl, setSerialPhotoUrl] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [luthierName, setLuthierName] = useState('');
  const [otherDescription, setOtherDescription] = useState('');
  const [claimReason, setClaimReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch guitar data on mount
  useEffect(() => {
    const loadGuitar = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('instruments')
          .select('id, make, model, year, serial_number, current_owner_id, is_claimable, image_url')
          .eq('id', guitarId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) {
          setError('Guitar not found');
          return;
        }

        setGuitar(data);
      } catch (err) {
        console.error('Error loading guitar:', err);
        setError('Failed to load guitar information');
      } finally {
        setLoading(false);
      }
    };

    loadGuitar();
  }, [guitarId]);

  // Check for pending claim
  const checkPendingClaim = async () => {
    if (!user) return;
    const hasPending = await hasPendingClaim(user.id, guitarId);
    return hasPending;
  };

  // Handle file upload
  const handleFileUpload = async (file, onSuccess) => {
    if (!file) return;

    try {
      const ext = file.name.split('.').pop();
      const path = `claims/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from('claim-evidence')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.warn('Upload failed:', uploadError.message);
        // Fallback to object URL
        onSuccess(URL.createObjectURL(file));
        return;
      }

      const { data: urlData } = supabase.storage
        .from('claim-evidence')
        .getPublicUrl(data.path);

      onSuccess(urlData.publicUrl);
    } catch (err) {
      console.warn('Upload error:', err);
      onSuccess(URL.createObjectURL(file));
    }
  };

  // Handle claim submission
  const handleSubmitClaim = async () => {
    if (!user || !profile) {
      setError('You must be logged in to claim a guitar');
      return;
    }

    setSubmitting(true);
    try {
      const verificationData = {};

      if (verificationType === 'instagram_match') {
        verificationData.instagram_handle = instagramHandle;
      } else if (verificationType === 'serial_photo') {
        verificationData.serial_photo_url = serialPhotoUrl;
      } else if (verificationType === 'receipt') {
        verificationData.receipt_url = receiptUrl;
      } else if (verificationType === 'luthier_vouch') {
        verificationData.luthier_name = luthierName;
      } else if (verificationType === 'other') {
        verificationData.description = otherDescription;
      }

      const { data, error: submitError } = await submitClaim({
        guitarId,
        claimerId: user.id,
        verificationType,
        verificationData,
        claimReason,
      });

      if (submitError) {
        setError(submitError.message || 'Failed to submit claim');
        return;
      }

      setClaimId(data.id);
      setStep(3);
    } catch (err) {
      console.error('Error submitting claim:', err);
      setError(err.message || 'An error occurred while submitting your claim');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: T.txt2 }}>Loading guitar information...</div>
      </div>
    );
  }

  if (error && step === 1) {
    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: '100vh', padding: '40px 20px' }}>
        <div className="max-w-2xl mx-auto">
          <Link to="/" style={{ color: T.warm, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <div style={{ backgroundColor: T.bgCard, borderColor: T.border, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
            <AlertCircle size={40} style={{ color: '#EF4444', margin: '0 auto 15px' }} />
            <h2 style={{ color: T.txt, fontSize: '20px', fontWeight: 600, marginBottom: '10px' }}>Error</h2>
            <p style={{ color: T.txt2 }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!guitar && !loading) {
    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: '100vh', padding: '40px 20px' }}>
        <div className="max-w-2xl mx-auto">
          <Link to="/" style={{ color: T.warm, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <div style={{ backgroundColor: T.bgCard, borderColor: T.border, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
            <AlertCircle size={40} style={{ color: '#EF4444', margin: '0 auto 15px' }} />
            <h2 style={{ color: T.txt, fontSize: '20px', fontWeight: 600, marginBottom: '10px' }}>Guitar Not Found</h2>
            <p style={{ color: T.txt2 }}>We couldn't find the guitar you're trying to claim.</p>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Guitar Preview
  if (step === 1) {
    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: '100vh', padding: '40px 20px' }}>
        <div className="max-w-2xl mx-auto">
          <Link to="/" style={{ color: T.warm, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>
            <ArrowLeft size={20} />
            Back
          </Link>

          <div style={{ backgroundColor: T.bgCard, borderColor: T.border, border: `1px solid ${T.border}`, borderRadius: '12px', overflow: 'hidden' }}>
            {/* Guitar Image */}
            {guitar.image_url && (
              <div style={{ width: '100%', height: '300px', overflow: 'hidden', backgroundColor: T.bgElev }}>
                <img
                  src={guitar.image_url}
                  alt={`${guitar.make} ${guitar.model}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Guitar Info */}
            <div style={{ padding: '30px' }}>
              <h1 style={{ color: T.txt, fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
                {guitar.make} {guitar.model}
              </h1>
              <p style={{ color: T.txt2, marginBottom: '20px' }}>{guitar.year}</p>

              {guitar.serial_number && (
                <div style={{ color: T.txt2, fontSize: '13px', marginBottom: '20px', fontFamily: "'JetBrains Mono', monospace" }}>
                  <span style={{ color: T.txtM }}>Serial: </span>{guitar.serial_number}
                </div>
              )}

              {/* Status Messages */}
              {!user ? (
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3B82F6', border: `1px solid #3B82F6`, borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <AlertCircle size={20} style={{ color: '#3B82F6', flexShrink: 0 }} />
                    <div>
                      <p style={{ color: '#3B82F6', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Sign in to claim this guitar</p>
                      <Link to="/auth" style={{ color: T.warm, textDecoration: 'underline', fontSize: '14px' }}>
                        Log in or create an account →
                      </Link>
                    </div>
                  </div>
                </div>
              ) : guitar.current_owner_id && !guitar.is_claimable ? (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444', border: `1px solid #EF4444`, borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <AlertCircle size={20} style={{ color: '#EF4444', flexShrink: 0 }} />
                    <p style={{ color: '#EF4444', fontSize: '14px' }}>This guitar has already been claimed</p>
                  </div>
                </div>
              ) : null}

              {/* Claim Button */}
              {user && guitar.is_claimable && (
                <button
                  onClick={() => setStep(2)}
                  style={{
                    backgroundColor: T.warm,
                    color: T.bgDeep,
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  className="hover:opacity-90"
                >
                  Claim This Guitar →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Verification Evidence
  if (step === 2) {
    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: '100vh', padding: '40px 20px' }}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setStep(1)}
            style={{ color: T.warm, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div style={{ backgroundColor: T.bgCard, borderColor: T.border, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '30px' }}>
            <h1 style={{ color: T.txt, fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Verify Your Ownership</h1>
            <p style={{ color: T.txt2, marginBottom: '30px' }}>
              Tell us how you own this {guitar.make} {guitar.model}
            </p>

            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444', border: `1px solid #EF4444`, borderRadius: '8px', padding: '12px 15px', marginBottom: '20px' }}>
                <p style={{ color: '#EF4444', fontSize: '14px' }}>{error}</p>
              </div>
            )}

            {/* Verification Type Selection */}
            <div className="space-y-3 mb-6">
              {[
                { id: 'instagram_match', label: 'Instagram Match', desc: 'Your Instagram handle matches the original poster', icon: Instagram },
                { id: 'serial_photo', label: 'Serial Number Photo', desc: 'Photo of the serial number matching our records', icon: Hash },
                { id: 'receipt', label: 'Purchase Receipt', desc: 'Receipt, invoice, or certificate of authenticity', icon: FileText },
                { id: 'luthier_vouch', label: 'Luthier Vouching', desc: 'A verified luthier can confirm your ownership', icon: Shield },
                { id: 'other', label: 'Other Evidence', desc: 'Photos, documentation, or other proof', icon: Camera },
              ].map(vtype => {
                const Icon = vtype.icon;
                return (
                  <label
                    key={vtype.id}
                    style={{
                      backgroundColor: verificationType === vtype.id ? T.bgElev : T.bgDeep,
                      borderColor: verificationType === vtype.id ? T.warm : T.border,
                      border: `1px solid`,
                      borderRadius: '8px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                    className="hover:opacity-75 transition"
                  >
                    <input
                      type="radio"
                      name="verifyType"
                      value={vtype.id}
                      checked={verificationType === vtype.id}
                      onChange={(e) => setVerificationType(e.target.value)}
                      style={{ marginTop: '2px', cursor: 'pointer' }}
                    />
                    <div className="flex-1">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Icon size={18} style={{ color: T.warm }} />
                        <span style={{ color: T.txt, fontWeight: 600, fontSize: '14px' }}>{vtype.label}</span>
                      </div>
                      <p style={{ color: T.txt2, fontSize: '13px' }}>{vtype.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Verification Input Fields */}
            <div className="space-y-4 mb-6">
              {verificationType === 'instagram_match' && (
                <div>
                  <label style={{ color: T.txt2, fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    placeholder="@yourinstagram"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    style={{
                      backgroundColor: T.bgElev,
                      color: T.txt,
                      borderColor: T.border,
                      border: `1px solid ${T.border}`,
                      borderRadius: '6px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      width: '100%',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {verificationType === 'serial_photo' && (
                <div>
                  <label style={{ color: T.txt2, fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Serial Number Photo
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files?.[0], setSerialPhotoUrl)}
                      style={{
                        backgroundColor: T.bgElev,
                        color: T.txt,
                        borderColor: T.border,
                        border: `1px solid ${T.border}`,
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        flex: 1,
                      }}
                    />
                    {serialPhotoUrl && <CheckCircle size={20} style={{ color: '#10B981' }} />}
                  </div>
                </div>
              )}

              {verificationType === 'receipt' && (
                <div>
                  <label style={{ color: T.txt2, fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Receipt or Invoice
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e.target.files?.[0], setReceiptUrl)}
                      style={{
                        backgroundColor: T.bgElev,
                        color: T.txt,
                        borderColor: T.border,
                        border: `1px solid ${T.border}`,
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        flex: 1,
                      }}
                    />
                    {receiptUrl && <CheckCircle size={20} style={{ color: '#10B981' }} />}
                  </div>
                </div>
              )}

              {verificationType === 'luthier_vouch' && (
                <div>
                  <label style={{ color: T.txt2, fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Luthier Name / Contact
                  </label>
                  <input
                    type="text"
                    placeholder="Name or website of the luthier"
                    value={luthierName}
                    onChange={(e) => setLuthierName(e.target.value)}
                    style={{
                      backgroundColor: T.bgElev,
                      color: T.txt,
                      borderColor: T.border,
                      border: `1px solid ${T.border}`,
                      borderRadius: '6px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      width: '100%',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {verificationType === 'other' && (
                <div>
                  <label style={{ color: T.txt2, fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    Description of Evidence
                  </label>
                  <textarea
                    placeholder="Tell us what evidence you have..."
                    value={otherDescription}
                    onChange={(e) => setOtherDescription(e.target.value)}
                    style={{
                      backgroundColor: T.bgElev,
                      color: T.txt,
                      borderColor: T.border,
                      border: `1px solid ${T.border}`,
                      borderRadius: '6px',
                      padding: '10px 12px',
                      fontSize: '14px',
                      width: '100%',
                      outline: 'none',
                      minHeight: '100px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Claim Reason */}
            <div className="mb-6">
              <label style={{ color: T.txt2, fontSize: '12px', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                Tell us about this guitar
              </label>
              <textarea
                placeholder="Where did you get this guitar? Any special stories or details?"
                value={claimReason}
                onChange={(e) => setClaimReason(e.target.value)}
                style={{
                  backgroundColor: T.bgElev,
                  color: T.txt,
                  borderColor: T.border,
                  border: `1px solid ${T.border}`,
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '14px',
                  width: '100%',
                  outline: 'none',
                  minHeight: '120px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitClaim}
              disabled={submitting}
              style={{
                backgroundColor: submitting ? T.txtM : T.warm,
                color: T.bgDeep,
                width: '100%',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '15px',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
              className="hover:opacity-90"
            >
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Confirmation
  if (step === 3) {
    return (
      <div style={{ backgroundColor: T.bgDeep, minHeight: '100vh', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="max-w-2xl mx-auto text-center w-full">
          <div style={{ backgroundColor: T.bgCard, borderColor: T.border, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '50px 30px' }}>
            <div style={{ marginBottom: '30px' }}>
              <CheckCircle size={64} style={{ color: '#10B981', margin: '0 auto' }} />
            </div>

            <h1 style={{ color: T.txt, fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>
              Your claim has been submitted!
            </h1>

            <p style={{ color: T.txt2, fontSize: '16px', marginBottom: '30px' }}>
              Our team will review your evidence and get back to you within 48 hours.
            </p>

            {claimId && (
              <div style={{ backgroundColor: T.bgElev, borderColor: T.border, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '15px', marginBottom: '30px', fontFamily: "'JetBrains Mono', monospace" }}>
                <p style={{ color: T.txtM, fontSize: '12px', marginBottom: '6px' }}>CLAIM ID</p>
                <p style={{ color: T.txt, fontSize: '14px', wordBreak: 'break-all' }}>{claimId}</p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/collection"
                style={{
                  backgroundColor: T.warm,
                  color: T.bgDeep,
                  display: 'block',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
                className="hover:opacity-90"
              >
                View My Claims
              </Link>

              <Link
                to={`/guitar/${guitarId}`}
                style={{
                  backgroundColor: 'transparent',
                  color: T.warm,
                  display: 'block',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: `1px solid ${T.warm}`,
                  cursor: 'pointer',
                }}
                className="hover:opacity-90"
              >
                Back to Guitar
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

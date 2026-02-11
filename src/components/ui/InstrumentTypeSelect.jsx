import { Guitar } from 'lucide-react';
import { T } from '../../theme/tokens';

/**
 * InstrumentTypeSelect Component
 *
 * Dropdown select component for instrument type enum.
 * Provides consistent styling with other form elements.
 * Optionally includes "All Types" option.
 *
 * @component
 * @param {Object} props
 * @param {string} props.value - Currently selected instrument type
 * @param {Function} props.onChange - Callback when selection changes: onChange(value)
 * @param {boolean} [props.includeAll=false] - Whether to include "All Types" option as first option
 * @param {string} [props.placeholder] - Placeholder text when no value is selected
 *
 * @example
 * const [instrumentType, setInstrumentType] = useState('');
 * <InstrumentTypeSelect
 *   value={instrumentType}
 *   onChange={setInstrumentType}
 *   includeAll={true}
 * />
 */
export default function InstrumentTypeSelect({
  value,
  onChange,
  includeAll = false,
  placeholder = 'Select Instrument Type',
}) {
  // Instrument type options with labels
  const instrumentTypes = [
    { value: 'electric-guitar', label: 'Electric Guitar', icon: Guitar },
    { value: 'acoustic-guitar', label: 'Acoustic Guitar', icon: Guitar },
    { value: 'classical-guitar', label: 'Classical Guitar', icon: Guitar },
    { value: 'bass-guitar', label: 'Bass Guitar', icon: Guitar },
    { value: 'ukulele', label: 'Ukulele', icon: Guitar },
    { value: 'mandolin', label: 'Mandolin', icon: Guitar },
    { value: 'banjo', label: 'Banjo', icon: Guitar },
    { value: 'other', label: 'Other', icon: Guitar },
  ];

  return (
    <div style={{ width: '100%' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          paddingLeft: '36px',
          backgroundColor: T.bgDeep,
          border: `1px solid ${T.border}`,
          borderRadius: '6px',
          color: value ? T.txt : T.txt2,
          fontSize: '14px',
          fontFamily: "'DM Sans', sans-serif",
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(T.txt2)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          backgroundSize: '18px',
          paddingRight: '36px',
        }}
      >
        {!value && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {includeAll && (
          <option value="">All Types</option>
        )}

        {instrumentTypes.map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      {/* Guitar icon decoration */}
      <div style={{
        position: 'relative',
        marginTop: '-32px',
        marginLeft: '10px',
        display: 'inline-block',
        pointerEvents: 'none',
      }}>
        <Guitar
          size={16}
          color={value ? T.warm : T.txt2}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.7,
          }}
        />
      </div>
    </div>
  );
}

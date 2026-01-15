import { useState, useRef, useEffect } from 'react';

interface OtpVerificationProps {
    email: string;
    onVerify: (code: string) => Promise<void>;
    onResend?: () => Promise<void>;
    onClose: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({
    email,
    onVerify,
    onResend,
    onClose,
}) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 4);
        
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            if (i < 4) newOtp[i] = char;
        });
        setOtp(newOtp);

        // Focus last filled input or next empty
        const nextIndex = Math.min(pastedData.length, 3);
        inputRefs[nextIndex].current?.focus();
    };

    // Auto-submit when all 4 digits are filled
    useEffect(() => {
        const code = otp.join('');
        if (code.length === 4 && !loading) {
            handleSubmit();
        }
    }, [otp]);

    const handleSubmit = async () => {
        const code = otp.join('');
        if (code.length !== 4) return;
        
        setError('');
        setLoading(true);

        try {
            await onVerify(code);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Verification failed');
            setOtp(['', '', '', '']);
            inputRefs[0].current?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!onResend) return;

        setError('');
        setLoading(true);
        try {
            await onResend();
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#F2F2F2] rounded-3xl p-8 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Verify OTP</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <p className="text-gray-600 mb-6">
                    We've sent a verification code to <strong>{email}</strong>
                </p>

                <div className="flex gap-3 justify-center mb-4">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={inputRefs[index]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            className="w-14 h-14 text-center text-2xl font-semibold bg-[#0000000D] rounded-xl outline-none border-2 border-transparent focus:border-[#28A453] transition-all"
                            disabled={loading}
                        />
                    ))}
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center mb-4">{error}</p>
                )}

                {loading && (
                    <p className="text-center text-gray-600 mb-4">Verifying...</p>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading || otp.join('').length !== 4}
                    className="w-full py-[15px] bg-[#28A453] rounded-4xl text-[20px] font-semibold text-white cursor-pointer hover:opacity-70 duration-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                >
                    {loading ? 'Verifying...' : 'Send'}
                </button>

                {error && onResend && (
                    <button
                        onClick={handleResend}
                        disabled={loading}
                        className="w-full py-[15px] bg-transparent border-2 border-[#28A453] rounded-4xl text-[20px] font-semibold text-[#28A453] cursor-pointer hover:bg-[#28A453] hover:text-white duration-300 active:scale-98 disabled:opacity-50"
                    >
                        Resend OTP
                    </button>
                )}
            </div>
        </div>
    );
};

export default OtpVerification;

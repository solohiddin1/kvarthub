import { useState } from 'react';

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
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await onVerify(code);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Verification failed');
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

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter OTP code"
                        className="py-4 pl-6 rounded-[30px] font-semibold text-[18px] bg-[#0000000D] placeholder:text-[#1C1C1C] w-full outline-none border border-transparent duration-300 hover:bg-[#4DB2700D] hover:border hover:border-[#28A453]"
                        required
                        maxLength={6}
                    />

                    {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-[15px] mt-6 bg-[#28A453] rounded-4xl text-[20px] font-semibold text-white cursor-pointer hover:opacity-70 duration-300 active:scale-98 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                </form>

                {onResend && (
                    <button
                        onClick={handleResend}
                        disabled={loading}
                        className="w-full mt-4 text-[#28A453] hover:underline disabled:opacity-50"
                    >
                        Resend OTP
                    </button>
                )}
            </div>
        </div>
    );
};

export default OtpVerification;

import { Link } from 'react-router-dom';
import { useLoginForm } from '../hooks/useLoginForm';

const LoginPage = () => {
  const { register, onSubmit, errors, isLoading } = useLoginForm();

  return (
    <div className="text-left">
      <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Đăng nhập tài khoản</h3>
      
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="email@example.com"
            {...register('email', { 
              required: 'Vui lòng nhập Email',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email không đúng định dạng'
              }
            })}
            className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-800 text-sm"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Mật khẩu
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('password', { 
              required: 'Vui lòng nhập mật khẩu',
              minLength: {
                value: 6,
                message: 'Mật khẩu phải từ 6 ký tự trở lên'
              }
            })}
            className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 text-slate-800 text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang đăng nhập...
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>

      {/* Register Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

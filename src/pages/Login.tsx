import { useState } from 'react';
import { useBoxing } from '../context/BoxingContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

const Login = () => {
    const { login } = useBoxing();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const user = await login(username, password);

        if (!user) {
            setError('Usuário ou senha incorretos');
            return;
        }

        navigate(user.role === 'professor' ? '/professor' : '/student');
    };

    return (
        // PARA ADICIONAR IMAGEM DE FUNDO:
        // 1. Coloque sua imagem na pasta 'public' (ex: fundo-login.jpg)
        // 2. Descomente a linha 'backgroundImage' abaixo
        <div
            className="min-h-screen bg-slate-900 flex items-center justify-center p-4 bg-cover bg-center bg-fixed relative"
            style={{
                backgroundImage: 'url(/bg-login.jpg)',
            }}
        >
            {/* Dark Overlay for better contrast */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            {/* Glassmorphism Card */}
            <div className="relative bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Boxe School</h1>
                    <p className="text-slate-400">Sistema de Gerenciamento de Treinos</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Usuário</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Digite seu usuário"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Senha</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Digite sua senha"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/40 hover:to-purple-500/40 border border-indigo-500/30 text-indigo-100 p-3 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-md"
                    >
                        <LogIn className="w-5 h-5" />
                        Entrar
                    </button>
                </form>

                <div className="border-t border-slate-700 pt-6 space-y-3">
                    <p className="text-center text-slate-400 text-sm mb-4">Não tem uma conta?</p>

                    <Link
                        to="/register/student"
                        className="w-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/40 hover:to-teal-500/40 border border-emerald-500/30 text-emerald-100 p-3 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] backdrop-blur-md"
                    >
                        <UserPlus className="w-5 h-5" />
                        Cadastrar-se
                    </Link>

                    {/* Hidden professor registration - accessible via /register/professor/secret */}
                </div>
            </div>
        </div>
    );
};

export default Login;

import { useEffect } from "react";

export default function SimpleLanding() {
  useEffect(() => {
    document.title = "AfiliadosBet - Sistema de Afiliados";
  }, []);

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">
            Transforme Seu{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Tráfego em Dinheiro
            </span>
          </h1>
          <p className="text-2xl mb-8 text-gray-300">
            Ganhe até R$ 15.000+ por mês como afiliado das melhores casas de apostas
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.href = "/register"}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold rounded-lg"
            >
              Cadastrar Grátis
            </button>
            <button 
              onClick={() => window.location.href = "/login"}
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg rounded-lg"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
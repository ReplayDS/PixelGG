import React from 'react';
import { Instagram, MessageCircle, Mail } from 'lucide-react';
import './footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Coluna 1: Logo e Info */}
        <div className="footer-column">
          <div className="footer-logo">
            <h3>PixelGG</h3>
            <p>Sua loja de confiança desde 2025</p>
          </div>
          <div className="footer-contact">
            <p><strong>WhatsApp:</strong> (11) 9 9139-7694</p>
            <p><strong>Email:</strong> contato@pixelgg.com.br</p>
          </div>
        </div>

        {/* Coluna 2: Categorias */}
        <div className="footer-column">
          <h4>Categorias</h4>
          <ul>
            <li><a href="#/catalog?category=games">Jogos Steam</a></li>
            <li><a href="#/catalog?category=discount">Desconto da Semana</a></li>
            <li><a href="#/catalog?category=pc">PC</a></li>
            <li><a href="#/catalog?category=packages">Pacote de Jogos</a></li>
          </ul>
        </div>

        {/* Coluna 3: Como Funciona */}
        <div className="footer-column">
          <h4>Como Funciona</h4>
          <ul>
            <li><a href="#/help">Dúvidas</a></li>
            <li><a href="#contact">Contato</a></li>
            <li><a href="#/terms">Termos de Uso</a></li>
            <li><a href="#/refund-policy">Política de Reembolso</a></li>
          </ul>
        </div>

        {/* Coluna 4: Siga-nos */}
        <div className="footer-column">
          <h4>Siga-nos</h4>
          <div className="footer-socials">
            <a href="https://instagram.com/pixelgg" target="_blank" rel="noopener noreferrer" title="Instagram">
              <Instagram size={24} />
            </a>
            <a href="https://wa.me/5511991397694" target="_blank" rel="noopener noreferrer" title="WhatsApp">
              <MessageCircle size={24} />
            </a>
            <a href="mailto:contato@pixelgg.com.br" title="Email">
              <Mail size={24} />
            </a>
          </div>
        </div>
      </div>

      {/* Linha divisória */}
      <div className="footer-divider"></div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>
          CNPJ: XX.XXX.XXX/0000-XX © Copyright {currentYear} | PixelGG - Todos os Direitos Reservados
        </p>
      </div>
    </footer>
  );
}

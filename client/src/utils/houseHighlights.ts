// Utility functions to generate promotional highlights for betting houses

interface HighlightConfig {
  title: string;
  subtitle: string;
  badge?: string;
  icon?: string;
  color?: string;
  animation?: string;
}

export function generateHighlights(house: any): HighlightConfig {
  const { name, description, commissionType, revshareValue, cpaValue, revshareAffiliatePercent, cpaAffiliatePercent } = house;
  
  // Analyze commission attractiveness
  const hasHighRevShare = revshareAffiliatePercent && revshareAffiliatePercent >= 20;
  const hasHighCPA = cpaAffiliatePercent && cpaAffiliatePercent >= 30;
  const isHybrid = commissionType === 'Hybrid';
  
  // Generate highlights based on description keywords and commission data
  let highlights: HighlightConfig;
  
  if (description) {
    const desc = description.toLowerCase();
    
    // Check for specific keywords in description
    if (desc.includes('maior') || desc.includes('lider') || desc.includes('principal')) {
      highlights = {
        title: "Casa Líder de Mercado",
        subtitle: "Alta taxa de conversão garantida",
        badge: "TOP PERFORMANCE",
        icon: "👑",
        color: "gold",
        animation: "pulse"
      };
    } else if (desc.includes('rapido') || desc.includes('rápido') || desc.includes('instantaneo')) {
      highlights = {
        title: "Pagamentos Instantâneos",
        subtitle: "Agilidade que converte jogadores",
        badge: "SAQUE RÁPIDO",
        icon: "⚡",
        color: "electric-blue",
        animation: "glow"
      };
    } else if (desc.includes('brasileiro') || desc.includes('brasil') || desc.includes('nacional')) {
      highlights = {
        title: "Preferida dos Brasileiros",
        subtitle: "Altíssima taxa de retenção",
        badge: "BRASIL FAVORITE",
        icon: "🇧🇷",
        color: "green-yellow",
        animation: "bounce"
      };
    } else if (desc.includes('apostas esportivas') || desc.includes('esporte')) {
      highlights = {
        title: "Especialista em Esportes",
        subtitle: "Cobertura completa que atrai jogadores",
        badge: "SPORTS EXPERT",
        icon: "⚽",
        color: "lime-green",
        animation: "pulse"
      };
    } else if (desc.includes('cassino') || desc.includes('casino') || desc.includes('slots')) {
      highlights = {
        title: "Variedade de Jogos Premium",
        subtitle: "Entretenimento que gera receita",
        badge: "CASINO HITS",
        icon: "🎰",
        color: "purple-gold",
        animation: "sparkle"
      };
    } else {
      highlights = {
        title: "Oportunidade Premium",
        subtitle: "Casa com alta performance comprovada",
        badge: "HIGH CONVERT",
        icon: "💎",
        color: "premium-blue",
        animation: "float"
      };
    }
  } else {
    // Default highlight if no description
    highlights = {
      title: "Casa de Alta Performance",
      subtitle: "Oportunidade de ganhos consistentes",
      badge: "PERFORMANCE",
      icon: "📈",
      color: "success-green",
      animation: "pulse"
    };
  }
  
  // Enhance based on commission type and values
  if (isHybrid) {
    highlights.title = `${highlights.title} - Dupla Receita`;
    highlights.subtitle = "CPA + RevShare para máxima rentabilidade";
    highlights.badge = "HÍBRIDO PREMIUM";
    highlights.icon = "💰";
  } else if (hasHighRevShare) {
    highlights.subtitle = `${highlights.subtitle} - Rev ${revshareAffiliatePercent}%`;
    highlights.badge = "ALTA COMISSÃO";
  } else if (hasHighCPA) {
    highlights.subtitle = `${highlights.subtitle} - CPA ${cpaAffiliatePercent}%`;
    highlights.badge = "CPA PREMIUM";
  }
  
  return highlights;
}

export function getVisualElements(highlight: HighlightConfig) {
  const colorSchemes = {
    'gold': 'from-yellow-400 via-yellow-500 to-yellow-600',
    'electric-blue': 'from-blue-400 via-blue-500 to-blue-600',
    'green-yellow': 'from-green-400 via-yellow-400 to-green-500',
    'lime-green': 'from-lime-400 via-green-500 to-emerald-600',
    'purple-gold': 'from-purple-400 via-pink-500 to-yellow-500',
    'premium-blue': 'from-blue-500 via-indigo-600 to-purple-600',
    'success-green': 'from-emerald-400 via-green-500 to-teal-600'
  };
  
  const animations = {
    'pulse': 'animate-pulse',
    'glow': 'animate-bounce',
    'bounce': 'animate-bounce',
    'sparkle': 'animate-ping',
    'float': 'animate-pulse'
  };
  
  return {
    gradient: colorSchemes[highlight.color as keyof typeof colorSchemes] || colorSchemes['premium-blue'],
    animation: animations[highlight.animation as keyof typeof animations] || animations['pulse'],
    badgeColor: highlight.color === 'gold' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                highlight.color === 'electric-blue' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                'bg-gradient-to-r from-emerald-400 to-emerald-600'
  };
}

export function shouldHighlight(house: any): boolean {
  // Criteria for highlighting a house
  const hasGoodCommission = (house.revshareAffiliatePercent && house.revshareAffiliatePercent >= 18) ||
                           (house.cpaAffiliatePercent && house.cpaAffiliatePercent >= 25);
  
  const isPopular = house.description && (
    house.description.toLowerCase().includes('popular') ||
    house.description.toLowerCase().includes('lider') ||
    house.description.toLowerCase().includes('maior') ||
    house.description.toLowerCase().includes('brasileiro')
  );
  
  const isHybrid = house.commissionType === 'Hybrid';
  
  return hasGoodCommission || isPopular || isHybrid;
}
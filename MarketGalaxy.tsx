import { useEffect, useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import { Loader2, Sparkles, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import * as THREE from 'three';
import { getCompanyProfile, getCryptoQuote, getStockQuote } from '../services/stockApi';

interface Satellite {
  symbol: string;
  name: string;
  relationship: string;
}

interface Company {
  symbol: string;
  name: string;
  marketCap: number;
  price: number;
  change: number;
  position: [number, number, number];
  color: string;
  satellites?: Satellite[];
  orbitRadius?: number;
  orbitSpeed?: number;
  startAngle?: number;
}

interface CompanySeed {
  symbol: string;
  name: string;
  fallbackMarketCap: number;
  satellites?: Satellite[];
}

const companySeeds: CompanySeed[] = [
  {
    symbol: 'AAPL',
    name: 'Apple',
    fallbackMarketCap: 3000000,
    satellites: [
      { symbol: 'AAPL', name: 'Foxconn', relationship: 'Manufacturing Partner' },
      { symbol: 'AAPL', name: 'TSMC', relationship: 'Chip Supplier' },
    ]
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    fallbackMarketCap: 2800000,
    satellites: [
      { symbol: 'MSFT', name: 'OpenAI', relationship: 'AI Partnership' },
      { symbol: 'MSFT', name: 'GitHub', relationship: 'Subsidiary' },
    ]
  },
  {
    symbol: 'GOOGL',
    name: 'Google',
    fallbackMarketCap: 1800000,
    satellites: [
      { symbol: 'GOOGL', name: 'DeepMind', relationship: 'AI Division' },
      { symbol: 'GOOGL', name: 'YouTube', relationship: 'Subsidiary' },
    ]
  },
  {
    symbol: 'AMZN',
    name: 'Amazon',
    fallbackMarketCap: 1600000,
    satellites: [
      { symbol: 'AMZN', name: 'AWS', relationship: 'Cloud Division' },
      { symbol: 'AMZN', name: 'Whole Foods', relationship: 'Subsidiary' },
    ]
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA',
    fallbackMarketCap: 1240000,
    satellites: [
      { symbol: 'RR', name: 'Richtech Robotics', relationship: 'AI Customer' },
      { symbol: 'NVDA', name: 'OpenAI', relationship: 'GPU Partner' },
      { symbol: 'NVDA', name: 'TSMC', relationship: 'Manufacturing' },
    ]
  },
  {
    symbol: 'META',
    name: 'Meta',
    fallbackMarketCap: 900000,
    satellites: [
      { symbol: 'META', name: 'Instagram', relationship: 'Subsidiary' },
      { symbol: 'META', name: 'WhatsApp', relationship: 'Subsidiary' },
    ]
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    fallbackMarketCap: 770000,
    satellites: [
      { symbol: 'TSLA', name: 'SolarCity', relationship: 'Energy Division' },
      { symbol: 'TSLA', name: 'Panasonic', relationship: 'Battery Partner' },
    ]
  },
  {
    symbol: 'BRK.B',
    name: 'Berkshire',
    fallbackMarketCap: 750000,
    satellites: [
      { symbol: 'BRK.B', name: 'GEICO', relationship: 'Subsidiary' },
    ]
  },
  {
    symbol: 'V',
    name: 'Visa',
    fallbackMarketCap: 550000,
    satellites: [
      { symbol: 'V', name: 'Plaid', relationship: 'Partnership' },
    ]
  },
  {
    symbol: 'WMT',
    name: 'Walmart',
    fallbackMarketCap: 520000,
    satellites: [
      { symbol: 'WMT', name: 'Sam\'s Club', relationship: 'Division' },
    ]
  },
  { symbol: 'JPM', name: 'JPMorgan', fallbackMarketCap: 500000 },
  {
    symbol: 'MA',
    name: 'Mastercard',
    fallbackMarketCap: 420000,
    satellites: [
      { symbol: 'MA', name: 'Fintech Partners', relationship: 'Network' },
    ]
  },
  { symbol: 'UNH', name: 'UnitedHealth', fallbackMarketCap: 480000 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', fallbackMarketCap: 380000 },
  {
    symbol: 'XOM',
    name: 'Exxon',
    fallbackMarketCap: 410000,
    satellites: [
      { symbol: 'XOM', name: 'Mobil', relationship: 'Legacy Merger' },
    ]
  },
  {
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    fallbackMarketCap: 1700000,
    satellites: [
      { symbol: 'BTC-USD', name: 'Lightning Network', relationship: 'Layer 2' },
      { symbol: 'BTC-USD', name: 'Miners', relationship: 'Network Security' },
    ]
  },
  {
    symbol: 'ETH-USD',
    name: 'Ethereum',
    fallbackMarketCap: 420000,
    satellites: [
      { symbol: 'ETH-USD', name: 'DeFi Protocols', relationship: 'Ecosystem' },
      { symbol: 'ETH-USD', name: 'NFT Markets', relationship: 'Use Case' },
    ]
  },
  {
    symbol: 'BNB-USD',
    name: 'BNB',
    fallbackMarketCap: 95000,
    satellites: [
      { symbol: 'BNB-USD', name: 'BSC', relationship: 'Blockchain' },
    ]
  },
  {
    symbol: 'SOL-USD',
    name: 'Solana',
    fallbackMarketCap: 80000,
    satellites: [
      { symbol: 'SOL-USD', name: 'Solana DeFi', relationship: 'Apps' },
    ]
  },
  {
    symbol: 'XRP-USD',
    name: 'Ripple',
    fallbackMarketCap: 140000,
    satellites: [
      { symbol: 'XRP-USD', name: 'RippleNet', relationship: 'Payment Network' },
    ]
  },
  {
    symbol: 'ADA-USD',
    name: 'Cardano',
    fallbackMarketCap: 35000,
    satellites: [
      { symbol: 'ADA-USD', name: 'Smart Contracts', relationship: 'Platform' },
    ]
  },
  {
    symbol: 'DOGE-USD',
    name: 'Dogecoin',
    fallbackMarketCap: 28000,
  },
  {
    symbol: 'AMD',
    name: 'AMD',
    fallbackMarketCap: 220000,
    satellites: [
      { symbol: 'AMD', name: 'OpenAI', relationship: 'AI Compute' },
      { symbol: 'AMD', name: 'Xilinx', relationship: 'Acquired' },
    ]
  },
];

const REFRESH_MS = 60000;

function formatMarketCap(millions: number): string {
  if (millions >= 1_000_000) {
    return `$${(millions / 1_000_000).toFixed(2)}T`;
  }
  if (millions >= 1_000) {
    return `$${(millions / 1_000).toFixed(1)}B`;
  }
  return `$${millions.toFixed(0)}M`;
}

interface SatelliteMoon {
  satellite: Satellite;
  position: [number, number, number];
}

function ConnectionLine({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const lineRef = useRef<any>(null);

  useFrame((state) => {
    const material = lineRef.current?.material;

    if (material) {
      const nextOpacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      if (Array.isArray(material)) {
        material.forEach(mat => {
          if ('opacity' in mat) {
            mat.opacity = nextOpacity;
          }
        });
      } else if ('opacity' in material) {
        material.opacity = nextOpacity;
      }
    }
  });

  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={2}
      opacity={0.4}
      transparent
      dashed
      dashScale={15}
      dashSize={0.8}
      gapSize={0.4}
    />
  );
}

function SatelliteSphere({
  satellite,
  position,
  parentColor,
  onClick
}: {
  satellite: Satellite;
  position: [number, number, number];
  parentColor: string;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.015;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }

    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshPhysicalMaterial
          color={parentColor}
          emissive={parentColor}
          emissiveIntensity={hovered ? 1.5 : 0.8}
          metalness={0.4}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial
          color={parentColor}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {hovered && (
        <Html distanceFactor={10} position={[0, 0.35, 0]} center>
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-teal-400/50 rounded-xl p-3 backdrop-blur-xl shadow-2xl shadow-teal-500/20 min-w-[160px] transform hover:scale-105 transition-transform">
            <div className="text-white font-black text-sm mb-1 flex items-center gap-2">
              <Zap className="w-3 h-3 text-teal-400" />
              {satellite.name}
            </div>
            <div className="text-teal-300 text-xs font-semibold">{satellite.relationship}</div>
          </div>
        </Html>
      )}

      <pointLight
        position={[0, 0, 0]}
        intensity={hovered ? 2 : 1}
        distance={1}
        color={parentColor}
        decay={1.5}
      />
    </group>
  );
}

function CompanySphere({
  company,
  satellites,
  onClick,
  isSelected
}: {
  company: Company;
  satellites: SatelliteMoon[];
  onClick: () => void;
  isSelected: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current && company.orbitRadius && company.orbitSpeed) {
      const angle = state.clock.elapsedTime * company.orbitSpeed + (company.startAngle || 0);
      groupRef.current.position.x = Math.cos(angle) * company.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * company.orbitRadius;
      groupRef.current.position.y = Math.sin(angle * 0.5) * 0.5;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;

      if (hovered || isSelected) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.15);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.15);
      }
    }

    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      glowRef.current.scale.setScalar(scale);
      glowRef.current.rotation.z += 0.001;
    }
  });

  const size = Math.max(0.4, Math.min(2.2, company.marketCap / 1000000));
  const isPositive = company.change >= 0;

  return (
    <>
      <group ref={groupRef} position={company.orbitRadius ? [0, 0, 0] : company.position}>
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[size, 48, 48]} />
          <meshPhysicalMaterial
            color={company.color}
            emissive={company.color}
            emissiveIntensity={hovered || isSelected ? 1.2 : 0.7}
            metalness={0.3}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transmission={0}
            thickness={0.5}
            ior={1.5}
          />
        </mesh>

        <mesh ref={glowRef}>
          <sphereGeometry args={[size * 1.15, 32, 32]} />
          <meshBasicMaterial
            color={company.color}
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </mesh>

        {(hovered || isSelected) && (
          <Html distanceFactor={10} position={[0, size + 0.7, 0]} center>
            <div className="bg-gradient-to-br from-slate-900/98 to-slate-800/98 border-2 border-teal-400/60 rounded-2xl p-4 backdrop-blur-xl shadow-2xl shadow-teal-500/30 min-w-[220px] transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-black text-lg tracking-tight">{company.symbol}</div>
                <Sparkles className="w-5 h-5 text-teal-400" />
              </div>
              <div className="text-slate-300 text-sm font-semibold mb-3">{company.name}</div>

              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-white font-black text-2xl">${company.price.toFixed(2)}</div>
                <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-teal-400' : 'text-rose-400'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {isPositive ? '+' : ''}{company.change.toFixed(2)}%
                </div>
              </div>

              <div className="text-slate-400 text-xs mb-3 font-semibold">
                Market Cap: {formatMarketCap(company.marketCap)}
              </div>

              {satellites.length > 0 && (
                <div className="pt-3 border-t border-teal-500/30">
                  <div className="text-teal-400 text-xs font-black flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                    {satellites.length} Connected Entit{satellites.length > 1 ? 'ies' : 'y'}
                  </div>
                </div>
              )}
            </div>
          </Html>
        )}

        <pointLight
          position={[0, 0, 0]}
          intensity={hovered || isSelected ? 4 : 2}
          distance={size * 5}
          color={company.color}
          decay={1.8}
        />
        {satellites.map((sat, idx) => (
          <ConnectionLine
            key={`line-${idx}`}
            start={[0, 0, 0]}
            end={sat.position}
            color={company.color}
          />
        ))}

        {satellites.map((sat, idx) => (
          <SatelliteSphere
            key={`sat-${idx}`}
            satellite={sat.satellite}
            position={sat.position}
            parentColor={company.color}
            onClick={onClick}
          />
        ))}
      </group>
    </>
  );
}

function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.001;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.03;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={sunRef}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[3.4, 32, 32]} />
        <meshBasicMaterial
          color="#fb923c"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[3.8, 32, 32]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      <pointLight
        position={[0, 0, 0]}
        intensity={10}
        distance={100}
        color="#fbbf24"
        decay={1.5}
      />
    </group>
  );
}

function OrbitPath({ radius }: { radius: number }) {
  const points = [];
  const segments = 128;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ));
  }

  return (
    <Line
      points={points}
      color="#334155"
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
}

function EnhancedStars() {
  const starsRef = useRef<THREE.Points>(null);
  const count = 2000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 150;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 150;

    const color = new THREE.Color();
    color.setHSL(0.55 + Math.random() * 0.1, 0.5, 0.7);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = Math.random() * 0.1 + 0.05;
  }

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function Scene({
  companies,
  selectedCompany,
  onSelectCompany
}: {
  companies: Company[];
  selectedCompany: string | null;
  onSelectCompany: (symbol: string) => void;
}) {
  const companiesWithSatellites = companies.map(company => {
    if (!company.satellites || company.satellites.length === 0) {
      return { company, satellites: [] };
    }

    const size = Math.max(0.4, Math.min(2.2, company.marketCap / 1000000));
    const satellites: SatelliteMoon[] = company.satellites.map((sat, idx) => {
      const angle = (idx / company.satellites!.length) * Math.PI * 2;
      const orbitRadius = size * 2.5;

      const offsetX = Math.cos(angle) * orbitRadius;
      const offsetZ = Math.sin(angle) * orbitRadius;
      const offsetY = Math.sin(angle * 2) * 0.25;

      return {
        satellite: sat,
        position: [offsetX, offsetY, offsetZ] as [number, number, number]
      };
    });

    return { company, satellites };
  });

  const uniqueOrbits = [...new Set(companies.map(c => c.orbitRadius).filter(Boolean))];

  return (
    <>
      <ambientLight intensity={0.2} />
      <hemisphereLight args={['#1e293b', '#0f172a', 0.3]} />

      <EnhancedStars />
      <Sun />

      {uniqueOrbits.map(radius => (
        <OrbitPath key={radius} radius={radius!} />
      ))}

      {companiesWithSatellites.map(({ company, satellites }) => (
        <CompanySphere
          key={company.symbol}
          company={company}
          satellites={satellites}
          onClick={() => onSelectCompany(company.symbol)}
          isSelected={selectedCompany === company.symbol}
        />
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={12}
        maxDistance={80}
        autoRotate
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </>
  );
}

export default function MarketGalaxy() {
  const [companiesData, setCompaniesData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'stocks' | 'crypto'>('stocks');

  useEffect(() => {
    let isMounted = true;

    const fetchCompaniesData = async (showLoader = false) => {
      if (showLoader) {
        setLoading(true);
      }

      try {
        const palette = [
          '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
          '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b',
          '#10b981', '#0ea5e9', '#22d3ee', '#14b8a6',
          '#a855f7', '#fb923c', '#fbbf24', '#06b6d4'
        ];

        const seeds = viewMode === 'crypto'
          ? companySeeds.filter(c => c.symbol.includes('-USD'))
          : companySeeds.filter(c => !c.symbol.includes('-USD'));

        const fetched = await Promise.all(
          seeds.map(async (seed) => {
            try {
              if (viewMode === 'crypto') {
                const quote = await getCryptoQuote(seed.symbol);

                return {
                symbol: seed.symbol,
                name: seed.name,
                marketCap: quote.marketCap || seed.fallbackMarketCap,
                price: quote.price ?? 0,
                change: quote.changePercent ?? 0,
                position: [0, 0, 0] as [number, number, number],
                color: '',
                satellites: seed.satellites,
              };
            }

              const [quote, profile] = await Promise.all([
                getStockQuote(seed.symbol),
                getCompanyProfile(seed.symbol),
              ]);

              const derivedMarketCap = profile.shareOutstanding && quote.c
                ? quote.c * profile.shareOutstanding
                : profile.marketCapitalization;

              return {
                symbol: seed.symbol,
                name: seed.name,
                marketCap: derivedMarketCap || seed.fallbackMarketCap,
                price: quote.c ?? 0,
                change: quote.dp ?? 0,
                position: [0, 0, 0] as [number, number, number],
                color: '',
                satellites: seed.satellites,
              };
            } catch {
              return {
                symbol: seed.symbol,
                name: seed.name,
                marketCap: seed.fallbackMarketCap,
                price: 100 + Math.random() * 400,
                change: (Math.random() - 0.5) * 10,
                position: [0, 0, 0] as [number, number, number],
                color: '',
                satellites: seed.satellites,
              };
            }
          })
        );

        const sortedByCap = [...fetched].sort((a, b) => b.marketCap - a.marketCap);

        const withOrbits = sortedByCap.map((company, idx) => ({
          ...company,
          color: palette[idx % palette.length],
          orbitRadius: 8 + (idx * 3.5),
          orbitSpeed: 0.08 / (idx + 1),
          startAngle: Math.random() * Math.PI * 2,
        }));

        if (isMounted) {
          setCompaniesData(withOrbits);
          setSelectedCompany((prev) =>
            prev && withOrbits.some(c => c.symbol === prev) ? prev : null
          );
        }
      } catch (error) {
        console.error('Error loading Market Galaxy data', error);
      } finally {
        if (showLoader && isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCompaniesData(true);
    const interval = setInterval(() => fetchCompaniesData(false), REFRESH_MS);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [viewMode]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Loader2 className="w-16 h-16 text-teal-400 animate-spin mb-4" />
        <div className="text-teal-400 font-bold text-lg animate-pulse">Loading Market Galaxy...</div>
      </div>
    );
  }

  const totalConnections = companiesData.reduce((acc, c) => acc + (c.satellites?.length || 0), 0);

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <div className="absolute top-6 left-6 z-10 flex items-center space-x-2">
        <button
          onClick={() => setViewMode('stocks')}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            viewMode === 'stocks'
              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/50'
              : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white backdrop-blur-sm'
          }`}
        >
          Stock Galaxy
        </button>
        <button
          onClick={() => setViewMode('crypto')}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            viewMode === 'crypto'
              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/50'
              : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white backdrop-blur-sm'
          }`}
        >
          Crypto Solar System
        </button>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent"></div>

      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 bg-gradient-to-br from-slate-900/95 to-slate-800/90 border border-teal-400/30 rounded-3xl p-4 md:p-6 backdrop-blur-2xl shadow-2xl shadow-teal-500/10 max-w-[340px] md:max-w-sm max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 md:p-3 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl border border-teal-400/30 flex-shrink-0">
            <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-teal-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent">
              Market Galaxy
            </h2>
            <p className="text-slate-400 text-xs md:text-sm font-semibold">Corporate Ecosystem</p>
          </div>
        </div>

        <div className="space-y-2 text-xs md:text-sm mb-4">
          <div className="flex items-center gap-2.5 text-slate-200 bg-slate-800/50 rounded-lg p-2">
            <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 shadow-lg shadow-teal-500/50 flex-shrink-0"></div>
            <span className="font-semibold">Planets = Companies</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-200 bg-slate-800/50 rounded-lg p-2">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 shadow-lg shadow-cyan-500/50 flex-shrink-0"></div>
            <span className="font-semibold">Moons = Partners</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-200 bg-slate-800/50 rounded-lg p-2">
            <div className="w-10 md:w-12 h-0.5 bg-gradient-to-r from-teal-400 via-teal-400/50 to-transparent flex-shrink-0"></div>
            <span className="font-semibold">Lines = Links</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-400/20 rounded-xl p-3 md:p-4 mb-3 md:mb-4">
          <div className="text-teal-300 text-[10px] md:text-xs font-black uppercase tracking-wider mb-2">Featured Connections</div>
          <div className="space-y-1.5 text-[10px] md:text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-teal-400 flex-shrink-0" />
              <span className="truncate">NVIDIA → Richtech, OpenAI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-cyan-400 flex-shrink-0" />
              <span className="truncate">Microsoft → OpenAI, GitHub</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-blue-400 flex-shrink-0" />
              <span className="truncate">AMD → OpenAI, Xilinx</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-[10px] md:text-xs text-slate-400">
          <div className="font-bold text-white text-xs md:text-sm mb-1.5">Controls</div>
          <div className="flex items-center gap-1.5">🖱️ <span>Drag to rotate</span></div>
          <div className="flex items-center gap-1.5">🔍 <span>Scroll to zoom</span></div>
          <div className="flex items-center gap-1.5">👆 <span>Hover for info</span></div>
        </div>
      </div>

      {selectedCompany && (
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 bg-gradient-to-br from-slate-900/95 to-slate-800/90 border border-teal-400/40 rounded-2xl p-4 md:p-5 backdrop-blur-2xl shadow-2xl shadow-teal-500/20 min-w-[160px] md:min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
            <div className="text-teal-400 text-[10px] md:text-xs font-black uppercase tracking-wider">Selected</div>
          </div>
          <div className="text-white font-black text-lg md:text-xl mb-1">
            {companiesData.find(c => c.symbol === selectedCompany)?.symbol}
          </div>
          <div className="text-slate-300 text-xs md:text-sm font-semibold mb-3">
            {companiesData.find(c => c.symbol === selectedCompany)?.name}
          </div>
          <button
            onClick={() => setSelectedCompany(null)}
            className="w-full text-[10px] md:text-xs text-teal-400 hover:text-teal-300 font-bold bg-teal-500/10 hover:bg-teal-500/20 py-2 rounded-lg transition-all"
          >
            Clear Selection
          </button>
        </div>
      )}

      <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 z-10 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 md:justify-between">
        <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/90 border border-teal-400/30 rounded-2xl px-4 md:px-6 py-2.5 md:py-3 backdrop-blur-2xl shadow-xl shadow-teal-500/10">
          <div className="flex items-center gap-2 md:gap-3 justify-center md:justify-start">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
              <span className="text-slate-300 text-xs md:text-sm font-semibold whitespace-nowrap">{companiesData.length} Companies</span>
            </div>
            <div className="w-px h-4 bg-slate-700"></div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-400" />
              <span className="text-slate-300 text-xs md:text-sm font-semibold whitespace-nowrap">{totalConnections} Connections</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-400/40 rounded-2xl px-4 md:px-6 py-2.5 md:py-3 backdrop-blur-2xl shadow-xl shadow-teal-500/20">
          <div className="text-teal-300 text-xs md:text-sm font-black flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
            <span className="hidden sm:inline">Explore the Corporate Universe</span>
            <span className="sm:hidden">Explore Universe</span>
          </div>
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 12, 35], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 30, 120]} />
        <Suspense fallback={null}>
          <Scene
            companies={companiesData}
            selectedCompany={selectedCompany}
            onSelectCompany={setSelectedCompany}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

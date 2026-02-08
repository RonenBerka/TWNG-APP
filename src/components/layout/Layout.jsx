import { T } from '../../theme/tokens';
import { useTheme } from '../../context/ThemeContext';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, transparent = false, noFooter = false }) {
  const { tokens: TH } = useTheme();

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: TH.bgDeep,
      color: TH.txt, fontFamily: "'DM Sans', sans-serif",
      display: "flex", flexDirection: "column",
      transition: "background-color 0.3s ease, color 0.3s ease",
    }}>
      <Navbar transparent={transparent} />
      <main style={{ flex: 1, paddingTop: transparent ? 0 : "64px" }}>
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  );
}

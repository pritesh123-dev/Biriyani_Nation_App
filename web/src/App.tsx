import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useApp } from './lib/store';
import { Loading } from './components/ui';
import ComingSoon from './screens/ComingSoon';

export default function App() {
  const { ready } = useApp();

  if (!ready) return <Loading />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ComingSoon />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

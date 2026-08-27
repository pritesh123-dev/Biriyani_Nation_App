import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useApp } from './lib/store';
import { Loading } from './components/ui';

import Home from './screens/Home';
import Login from './screens/Login';
import Verify from './screens/Verify';
import Name from './screens/Name';
import Menu from './screens/Menu';
import Dish from './screens/Dish';
import Cart from './screens/Cart';
import Checkout from './screens/Checkout';
import OrderStatus from './screens/OrderStatus';
import Party from './screens/Party';
import Refer from './screens/Refer';
import Account from './screens/Account';
import NotFound from './screens/NotFound';

export default function App() {
  const { ready } = useApp();

  if (!ready) return <Loading />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/name" element={<Name />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/dish/:id" element={<Dish />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="/order/:id" element={<RequireAuth><OrderStatus /></RequireAuth>} />
        <Route path="/party" element={<Party />} />
        <Route path="/refer" element={<RequireAuth><Refer /></RequireAuth>} />
        <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { signedIn } = useApp();
  if (!signedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

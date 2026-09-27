import React, { useState, useEffect } from 'react';
import { Persona, GastoMensual, GastoSalida, TabType } from './types';
import { DEFAULT_ROOMIES, DEFAULT_CONTACTOS } from './utils/storage';
import { calcularDeudas, calcularDeudasSalida, uid } from './utils/calculations';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { MensualTab } from './components/MensualTab';
import { SalidasTab } from './components/SalidasTab';
import { RuletaModal } from './components/RuletaModal';
import { CuentasTab } from './components/CuentasTab';
import { TicketModal } from './components/TicketModal';
import { BackupModal } from './components/BackupModal';
import { GroupManagementModal } from './components/GroupManagementModal';

type AppTheme = 'teal' | 'navy' | 'charcoal';

export default function App() {
  // Primary feature is now 'salida'!
  const [tab, setTab] = useState<TabType>('salida');

  // Core Data States
  const [roomies, setRoomies] = useState<Persona[]>(DEFAULT_ROOMIES);
  const [gastosMensuales, setGastosMensuales] = useState<GastoMensual[]>([]);
  const [contactos, setContactos] = useState<Persona[]>(DEFAULT_CONTACTOS);
  const [gastosSalida, setGastosSalida] = useState<GastoSalida[]>([]);
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const savedTheme = localStorage.getItem('rm-theme');
      if (savedTheme === 'navy' || savedTheme === 'charcoal') return savedTheme;
    } catch {
      // Continue with the default theme when storage is unavailable.
    }
    return 'teal';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const handleThemeChange = (nextTheme: AppTheme) => {
    setTheme(nextTheme);
    try {
      localStorage.setItem('rm-theme', nextTheme);
    } catch {
      // The selected theme still applies for this session.
    }
  };

  // Modals
  const [mostrarRuletaOverlay, setMostrarRuletaOverlay] = useState(false);
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [mostrarBackup, setMostrarBackup] = useState(false);
  const [mostrarGestionGrupo, setMostrarGestionGrupo] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const r = localStorage.getItem('rm-roomies');
      const gm = localStorage.getItem('rm-gastos-mensual');
      const c = localStorage.getItem('rm-contactos');
      const gs = localStorage.getItem('rm-gastos-salida');

      if (r) setRoomies(JSON.parse(r));
      if (gm) setGastosMensuales(JSON.parse(gm));
      if (c) setContactos(JSON.parse(c));
      if (gs) setGastosSalida(JSON.parse(gs));
    } catch {
      // Ignore localstorage parse error
    }
  }, []);

  // Save Handlers
  const handleSaveRoomies = (updated: Persona[]) => {
    setRoomies(updated);
    localStorage.setItem('rm-roomies', JSON.stringify(updated));
  };

  const handleSaveGastosMensuales = (updated: GastoMensual[]) => {
    setGastosMensuales(updated);
    localStorage.setItem('rm-gastos-mensual', JSON.stringify(updated));
  };

  const handleSaveContactos = (updated: Persona[]) => {
    setContactos(updated);
    localStorage.setItem('rm-contactos', JSON.stringify(updated));
  };

  const handleSaveGastosSalida = (updated: GastoSalida[]) => {
    setGastosSalida(updated);
    localStorage.setItem('rm-gastos-salida', JSON.stringify(updated));
  };

  const agregarRoomie = (nombre: string, avatar: string): Persona | null => {
    if (!nombre.trim()) return null;
    const nuevo = { id: uid(), nombre: nombre.trim(), avatar };
    handleSaveRoomies([...roomies, nuevo]);
    return nuevo;
  };

  const editarRoomie = (id: string, nombre: string, avatar: string) => {
    if (!nombre.trim()) return;
    handleSaveRoomies(roomies.map(roomie =>
      roomie.id === id ? { ...roomie, nombre: nombre.trim(), avatar } : roomie
    ));
  };

  const eliminarRoomie = (id: string) => {
    if (roomies.length <= 2) return;
    handleSaveRoomies(roomies.filter(roomie => roomie.id !== id));
  };

  const agregarContacto = (nombre: string, avatar: string): Persona | null => {
    if (!nombre.trim()) return null;
    const nuevo = { id: uid(), nombre: nombre.trim(), avatar };
    handleSaveContactos([...contactos, nuevo]);
    return nuevo;
  };

  const editarContacto = (id: string, nombre: string, avatar: string) => {
    if (!nombre.trim()) return;
    handleSaveContactos(contactos.map(contacto =>
      contacto.id === id ? { ...contacto, nombre: nombre.trim(), avatar } : contacto
    ));
  };

  const eliminarContacto = (id: string) => {
    if (contactos.length <= 1) return;
    handleSaveContactos(contactos.filter(contacto => contacto.id !== id));
  };

  const handleLimpiarMensual = () => {
    localStorage.removeItem('rm-gastos-mensual');
    setGastosMensuales([]);
  };

  const handleLimpiarSalidas = () => {
    localStorage.removeItem('rm-gastos-salida');
    setGastosSalida([]);
  };

  const handleImportData = (data: {
    roomies: Persona[];
    gastosMensuales: GastoMensual[];
    contactos: Persona[];
    gastosSalida: GastoSalida[];
  }) => {
    handleSaveRoomies(data.roomies);
    handleSaveGastosMensuales(data.gastosMensuales);
    handleSaveContactos(data.contactos);
    handleSaveGastosSalida(data.gastosSalida);
  };

  const handleResetData = () => {
    handleSaveRoomies(DEFAULT_ROOMIES);
    handleSaveGastosMensuales([]);
    handleSaveContactos(DEFAULT_CONTACTOS);
    handleSaveGastosSalida([]);
  };

  // Calculations for Badges & Header
  const totalMensual = gastosMensuales.reduce((s, g) => s + g.monto, 0);
  const totalSalidas = gastosSalida.reduce((s, g) => s + g.monto, 0);
  const deudasSalida = calcularDeudasSalida(gastosSalida, contactos);
  const deudasMensuales = calcularDeudas(gastosMensuales, roomies);

  // Active debts count to display in BottomNav
  const deudasCount = deudasSalida.length > 0 ? deudasSalida.length : deudasMensuales.length;

  return (
    <div className="app-container">
      {/* Top Bar / Header */}
      <Navbar
        totalMensual={totalMensual}
        totalSalidas={totalSalidas}
        activeTab={tab}
        onOpenBackup={() => setMostrarBackup(true)}
        onOpenTicket={() => setMostrarTicket(true)}
        onOpenGroup={() => setMostrarGestionGrupo(true)}
      />

      {/* Main Content Area */}
      <main className="pb-4">
        {tab === 'salida' && (
          <SalidasTab
            contactos={contactos}
            gastosSalida={gastosSalida}
            onSaveContactos={handleSaveContactos}
            onSaveGastos={handleSaveGastosSalida}
            onAbrirRuleta={() => setTab('ruleta')}
            onAddContacto={agregarContacto}
          />
        )}

        {tab === 'cuentas' && (
          <CuentasTab
            roomies={roomies}
            gastosMensuales={gastosMensuales}
            contactos={contactos}
            gastosSalida={gastosSalida}
            onLimpiarMensual={handleLimpiarMensual}
            onLimpiarSalidas={handleLimpiarSalidas}
            onOpenTicket={() => setMostrarTicket(true)}
          />
        )}

        {tab === 'ruleta' && (
          <RuletaModal
            roomies={roomies}
            contactos={contactos}
            isModal={false}
          />
        )}

        {tab === 'mensual' && (
          <MensualTab
            roomies={roomies}
            gastosMensuales={gastosMensuales}
            onSaveRoomies={handleSaveRoomies}
            onSaveGastos={handleSaveGastosMensuales}
            onAddRoomie={agregarRoomie}
          />
        )}
      </main>

      {/* Persistent Bottom Mobile Navigation */}
      <BottomNav
        activeTab={tab}
        onChangeTab={setTab}
        deudasCount={deudasCount}
      />

      {/* Modal Ruleta (when opened as overlay) */}
      {mostrarRuletaOverlay && (
        <RuletaModal
          roomies={roomies}
          contactos={contactos}
          isModal={true}
          onCerrar={() => setMostrarRuletaOverlay(false)}
        />
      )}

      {/* Modal Thermal Ticket / Receipt */}
      {mostrarTicket && (
        <TicketModal
          tipo={tab === 'mensual' ? 'mensual' : 'salida'}
          personas={tab === 'mensual' ? roomies : contactos}
          gastos={tab === 'mensual' ? gastosMensuales : gastosSalida}
          deudas={tab === 'mensual' ? deudasMensuales : deudasSalida}
          total={tab === 'mensual' ? totalMensual : totalSalidas}
          onCerrar={() => setMostrarTicket(false)}
        />
      )}

      {/* Modal Backup & Settings */}
      {mostrarBackup && (
        <BackupModal
          roomies={roomies}
          gastosMensuales={gastosMensuales}
          contactos={contactos}
          gastosSalida={gastosSalida}
          onImportData={handleImportData}
          onResetData={handleResetData}
          onCerrar={() => setMostrarBackup(false)}
        />
      )}

      {mostrarGestionGrupo && (
        <GroupManagementModal
          theme={theme}
          onThemeChange={handleThemeChange}
          roomies={roomies}
          contactos={contactos}
          gastosMensuales={gastosMensuales}
          gastosSalida={gastosSalida}
          onAddRoomie={agregarRoomie}
          onEditRoomie={editarRoomie}
          onDeleteRoomie={eliminarRoomie}
          onAddContacto={agregarContacto}
          onEditContacto={editarContacto}
          onDeleteContacto={eliminarContacto}
          onOpenBackup={() => {
            setMostrarGestionGrupo(false);
            setMostrarBackup(true);
          }}
          onCerrar={() => setMostrarGestionGrupo(false)}
        />
      )}
    </div>
  );
}

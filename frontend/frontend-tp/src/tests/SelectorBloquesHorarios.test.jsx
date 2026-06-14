import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SelectorBloquesHorarios from '../components/SelectorBloquesHorarios.jsx';
import * as turnosApi from '../api/turnos.api.js';

vi.mock('../api/turnos.api.js');

describe('SelectorBloquesHorarios', () => {
    const mockTutor = { id: 1, nombre: 'Tutor Test' };
    const mockFecha = '2023-10-10';

    beforeEach(() => {
        vi.clearAllMocks();
        // Sin turnos ocupados por defecto
        turnosApi.getTurnos.mockResolvedValue({ data: [] });
        
        // Mockear alert
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    it('no debe permitir seleccionar más de 2 horas (4 bloques de 30 min)', async () => {
        const handleRangoSelect = vi.fn();
        render(<SelectorBloquesHorarios tutor={mockTutor} fecha={mockFecha} onRangoSelect={handleRangoSelect} />);
        
        // Esperamos a que cargue
        await waitFor(() => {
            expect(screen.getByRole('button', { name: '08:00' })).toBeInTheDocument();
        });

        // Seleccionamos 4 bloques (2 horas)
        fireEvent.click(screen.getByRole('button', { name: '08:00' }));
        fireEvent.click(screen.getByRole('button', { name: '08:30' }));
        fireEvent.click(screen.getByRole('button', { name: '09:00' }));
        fireEvent.click(screen.getByRole('button', { name: '09:30' }));

        expect(handleRangoSelect).toHaveBeenLastCalledWith('08:00', '10:00');

        // Intentamos seleccionar un 5to bloque consecutivo
        fireEvent.click(screen.getByRole('button', { name: '10:00' }));

        // Debería mostrar un alert
        expect(window.alert).toHaveBeenCalledWith("No puedes seleccionar más de 2 horas.");
        
        // Y el último rango válido sigue siendo 08:00 a 10:00 (no cambió a 10:30)
        expect(handleRangoSelect).toHaveBeenLastCalledWith('08:00', '10:00');
    });

    it('debe reiniciar la selección si se eligen bloques no consecutivos', async () => {
        const handleRangoSelect = vi.fn();
        render(<SelectorBloquesHorarios tutor={mockTutor} fecha={mockFecha} onRangoSelect={handleRangoSelect} />);
        
        await waitFor(() => {
            expect(screen.getByRole('button', { name: '08:00' })).toBeInTheDocument();
        });

        // Seleccionamos 08:00 y 08:30 (consecutivos)
        fireEvent.click(screen.getByRole('button', { name: '08:00' }));
        fireEvent.click(screen.getByRole('button', { name: '08:30' }));
        
        expect(handleRangoSelect).toHaveBeenLastCalledWith('08:00', '09:00');

        // Seleccionamos 10:00 (NO consecutivo)
        fireEvent.click(screen.getByRole('button', { name: '10:00' }));

        // Se debe reiniciar la selección a solo el nuevo bloque (10:00 a 10:30)
        expect(handleRangoSelect).toHaveBeenLastCalledWith('10:00', '10:30');
    });
});

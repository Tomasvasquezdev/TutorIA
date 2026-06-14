import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TurnoForm from '../pages/TurnoForm.jsx';
import { BrowserRouter } from 'react-router-dom';
import * as tutoresApi from '../api/tutores.api.js';
import * as turnosApi from '../api/turnos.api.js';

// Mockear APIs
vi.mock('../api/tutores.api.js');
vi.mock('../api/turnos.api.js');

describe('TurnoForm - Validaciones de Turno y Componentes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock default behavior
        tutoresApi.getTutores.mockResolvedValue([
            { id: 1, nombre: 'Tutor Test', especialidad: 'Matemática', diasDisponibles: ['lunes', 'martes'] }
        ]);
        turnosApi.getTurnos.mockResolvedValue({ data: [] });
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <TurnoForm />
            </BrowserRouter>
        );
    };

    it('debe mostrar el calendario al seleccionar un tutor', async () => {
        renderComponent();
        
        // Esperamos a que el select se pueble
        await waitFor(() => {
            expect(screen.getByText(/Tutor Test/i)).toBeInTheDocument();
        });

        const select = screen.getAllByRole('combobox')[0];
        
        // Seleccionamos tutor
        fireEvent.change(select, { target: { value: '1' } });

        // Verificamos que se muestre el calendario: la leyenda "Seleccionado"
        // solo aparece cuando se renderiza la grilla de disponibilidad del tutor.
        await waitFor(() => {
            expect(screen.getByText('Seleccionado')).toBeInTheDocument();
        });
    });
});

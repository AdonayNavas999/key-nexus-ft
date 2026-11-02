import Swal from 'sweetalert2';

export const confirmarEliminacion = async (nombreApp: string): Promise<boolean> => {
  const resultado = await Swal.fire({
    title: `¿Eliminar ${nombreApp}?`,
    text: 'Esta acción borrará la credencial y todo su historial de cambios de forma permanente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-2xl shadow-xl',
      confirmButton: 'rounded-xl font-medium px-4 py-2',
      cancelButton: 'rounded-xl font-medium px-4 py-2',
    },
  });

  return resultado.isConfirmed;
};

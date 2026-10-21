import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from './Toast';
import { expect, test, describe, vi } from 'vitest';

// A dummy component to test Toast usage
const TestComponent = () => {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success('Berhasil menyimpan data')}>
        Show Success
      </button>
      <button onClick={() => toast.error('Gagal memuat data')}>
        Show Error
      </button>
      <button onClick={() => toast.confirm('Apakah yakin?', () => console.log('confirmed'))}>
        Show Confirm
      </button>
    </div>
  );
};

describe('Toast Component & Provider', () => {
  test('should display toast message when success button is clicked', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Show Success');
    fireEvent.click(button);

    const toastMessage = screen.getByText('Berhasil menyimpan data');
    expect(toastMessage).toBeInTheDocument();
  });

  test('should display error toast when error button is clicked', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Show Error');
    fireEvent.click(button);

    const toastMessage = screen.getByText('Gagal memuat data');
    expect(toastMessage).toBeInTheDocument();
  });

  test('should display confirm modal and trigger events', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Show Confirm');
    fireEvent.click(button);

    const confirmModalMessage = screen.getByText('Apakah yakin?');
    expect(confirmModalMessage).toBeInTheDocument();

    const yesButton = screen.getByText('Ya, Hapus');
    fireEvent.click(yesButton);

    expect(logSpy).toHaveBeenCalledWith('confirmed');
    expect(confirmModalMessage).not.toBeInTheDocument();
    
    logSpy.mockRestore();
  });

  test('should dismiss toast when close button (X) is clicked', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Show Success');
    fireEvent.click(button);

    const toastMessage = screen.getByText('Berhasil menyimpan data');
    expect(toastMessage).toBeInTheDocument();

    // Get all buttons on the screen: 3 buttons from TestComponent + 1 close button from ToastItem
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(4);

    // The close button is the last button (index 3)
    const closeBtn = buttons[3];
    fireEvent.click(closeBtn);

    // Toast should be removed from the document
    expect(toastMessage).not.toBeInTheDocument();
  });
});

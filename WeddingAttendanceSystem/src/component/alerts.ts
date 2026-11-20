export async function confirmAction(titleText: string, confirmButtonText: string, cancelButtonText: string) {
  const { default: Swal } = await import("sweetalert2");
  const result = await Swal.fire({
    titleText,
    icon: "warning",
    showCancelButton: true,
    focusCancel: true,
    confirmButtonText,
    cancelButtonText,
  });
  return result.isConfirmed;
}

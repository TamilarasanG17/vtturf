import Swal from "sweetalert2";

const baseConfig = {
  confirmButtonColor: "#16a34a",
  cancelButtonColor: "#94a3b8",
  customClass: {
    popup: "rounded-2xl",
  },
};

export const alertSuccess = (title, text) =>
  Swal.fire({ ...baseConfig, icon: "success", title, text, timer: 2200, showConfirmButton: false });

export const alertError = (title, text) =>
  Swal.fire({ ...baseConfig, icon: "error", title, text, confirmButtonText: "OK" });

export const alertWarning = (title, text) =>
  Swal.fire({ ...baseConfig, icon: "warning", title, text, confirmButtonText: "OK" });

export const alertConfirm = async (title, text, confirmText = "Confirm", icon = "warning") => {
  const result = await Swal.fire({
    ...baseConfig,
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancel",
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export const alertBookingConfirmation = async (details) => {
  const {
    turfName,
    location,
    date,
    time,
    name,
    email,
    members,
    totalAmount,
    paymentType,
  } = details;

  const result = await Swal.fire({
    ...baseConfig,
    title: "Booking Confirmation",
    html: `
      <div style="text-align:left; font-size:14px; line-height:1.7;">
        <p><b>Turf:</b> ${turfName}</p>
        <p><b>Location:</b> ${location}</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Time:</b> ${time}</p>
        <hr style="margin:8px 0;" />
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Members:</b> ${members}</p>
        <hr style="margin:8px 0;" />
        <p><b>Total Amount:</b> ₹${totalAmount}</p>
        <p><b>Payment Type:</b> ${paymentType}</p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Confirm Booking",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export default Swal;

// Implenting small device function to toggle smaller devices booking section
const toogle_btn = document.getElementById("toggle_smd_booking");
const smd_booking_section_hide_btn = document.getElementById("hide-booking-section");
const smd_booking_section = document.getElementById("smd-booking-section");

toogle_btn.addEventListener('click', () => {
    smd_booking_section.classList.remove('d-none');
    toogle_btn.style.display = "none";
})

smd_booking_section_hide_btn.addEventListener('click', () => {
    smd_booking_section.classList.add('d-none');
    toogle_btn.style.display = "block";
})
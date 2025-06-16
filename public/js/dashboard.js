const hotelModal = document.getElementById('hotelModal');

hotelModal.addEventListener('show.bs.modal', event => {
  const button = event.relatedTarget;

  const hotel = button.getAttribute('data-hotel');
  const city = button.getAttribute('data-city');
  const img = button.getAttribute('data-img');
  const price = button.getAttribute('data-price');

  hotelModal.querySelector('#hotelModalLabel').innerText = hotel;
  hotelModal.querySelector('#hotelModalCity').innerText = city;
  hotelModal.querySelector('#hotelModalImg').src = img;
  hotelModal.querySelector('#hotelModalPrice').innerText = price;
});

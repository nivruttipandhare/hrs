  // XHR Request Helper
        function makeRequest(method, url, data, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader('Content-Type', 'application/json'); 
            xhr.onload = function() {
                var responseData = null;
                if (xhr.getResponseHeader('Content-Type') && xhr.getResponseHeader('Content-Type').includes('application/json')) {
                    try {
                        responseData = JSON.parse(xhr.responseText);
                    } catch (e) {
                        console.error('Failed to parse JSON response:', e);
                        callback('Invalid JSON response', null);
                        return;
                    }
                } else {
                    responseData = { message: xhr.responseText || 'Server error' };
                }
                callback(xhr.status === 200 ? null : 'Error ' + xhr.status, responseData);
            };
            xhr.onerror = function() {
                callback('Network error (request failed).', null); 
            };
            xhr.send(JSON.stringify(data)); 
        }

        // View Details Handler (No changes)
        document.querySelectorAll('.view-details').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const hotelId = this.dataset.hotelId;
                const hotelDetailsContent = document.getElementById('hotel-details-content');

                hotelDetailsContent.innerHTML = `
                    <div class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">Loading details...</p>
                    </div>
                `;

                makeRequest('GET', '/api/hotel/' + hotelId, null, function(error, data) {
                    if (error) {
                        hotelDetailsContent.innerHTML = '<p class="text-danger text-center py-4">Failed to load details. ' + (data && data.message ? data.message : error) + '</p>';
                        console.error('Error fetching hotel details:', error, data);
                        return;
                    }

                    if (data && data.success && data.hotel) {
                        const hotel = data.hotel;
                        const amenities = data.amenities || [];

                        const amenitiesHtml = amenities.length
                            ? amenities.map(a => `<li>${a}</li>`).join('')
                            : '<li>No amenities listed</li>';

                        hotelDetailsContent.innerHTML = `
                            <h5>${hotel.hotel_name || 'Unknown Hotel'}</h5>
                            ${hotel.hotel_image ? '<img src="/Uploads/hotels/' + hotel.hotel_image + '" class="img-fluid mb-3 rounded" alt="Hotel Image" style="max-height:200px; width:100%; object-fit:cover;">' : '<p class="text-muted text-center">No image available</p>'}
                            <p>
                                <strong>City:</strong> ${hotel.city_name || 'N/A'}<br>
                                <strong>Area:</strong> ${hotel.area_name || 'N/A'}<br>
                                <strong>Email:</strong> ${hotel.hotel_email || 'N/A'}<br>
                                <strong>Contact:</strong> ${hotel.hotel_contact || 'N/A'}<br>
                                <strong>Rating:</strong> ${hotel.rating || 0} ⭐<br>
                                <strong>Reviews:</strong> ${hotel.reviewcount || 0}
                            </p>
                            <h6>Amenities:</h6>
                            <ul class="amenities-list">${amenitiesHtml}</ul>
                        `;

                        var modal = new bootstrap.Modal(document.getElementById('viewDetailsModal'));
                        modal.show();
                    } else {
                        hotelDetailsContent.innerHTML = '<p class="text-danger text-center py-4">Failed to load details. ' + (data ? (data.message || 'Invalid hotel data.') : 'Unknown error.') + '</p>';
                        console.error('Invalid data received for hotel details:', data);
                    }
                });
            });
        });
 /* ---------- BOOK‑NOW HANDLER with masked username ---------- */
document.querySelectorAll('.book-now').forEach(button => {
  button.addEventListener('click', e => {
    e.preventDefault();

    const hotelId   = button.dataset.hotelId;
    const hotelName = button.dataset.hotelName;

    /* 1️⃣ Ask for username (masked) */
    Swal.fire({
      title: 'Please enter your username',
      input: 'password',                 // <— shows dots/• • • •
      inputPlaceholder: 'Username',
      inputAttributes: { autocomplete: 'username', autocapitalize: 'off' },
      showCancelButton: true,
      confirmButtonText: 'Continue',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (!result.isConfirmed) return;   // user cancelled
      const username = result.value && result.value.trim();
      if (!username) {
        Swal.fire('Required', 'Username is required to book a hotel.', 'warning');
        return;
      }

      /* 2️⃣ Validate username via AJAX */
      makeRequest('POST', '/api/validate-username', { username }, (err, resp) => {
        if (err || !resp?.success) {
          Swal.fire('Error', (resp && resp.message) || 'Invalid username.', 'error');
          return;
        }

        /* 3️⃣ Prefill and open booking modal */
        document.getElementById('booking_hotel_id').value   = hotelId;
        document.getElementById('booking_hotel_name').value = hotelName;
        document.getElementById('booking_username').value   = username;

        const now = new Date();
        const hh  = now.getHours().toString().padStart(2, '0');
        const mm  = now.getMinutes().toString().padStart(2, '0');
        document.getElementById('checkin_time').value = `${hh}:${mm}`;

        new bootstrap.Modal('#bookingModal').show();
      });
    });
  });
});

    // Booking Form Submission
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var form = e.target;
      var btn = document.getElementById('confirmBookingBtn');
      btn.disabled = true;

      var checkinDate = new Date(form.checkin_date.value + 'T' + form.checkin_time.value);
      var checkoutDate = new Date(form.checkout_date.value + 'T' + form.checkout_time.value);
      
      var today = new Date();
      // Set hours, minutes, seconds, milliseconds to 0 for date-only comparison
      today.setHours(0, 0, 0, 0); 
      var checkinDateOnly = new Date(form.checkin_date.value); 
      checkinDateOnly.setHours(0,0,0,0);

      if (checkinDateOnly < today) {
        alert('Check-in date cannot be in the past.');
        btn.disabled = false;
        return;
      }
      if (checkoutDate <= checkinDate) {
        alert('Check-out date and time must be strictly after check-in date and time.');
        btn.disabled = false;
        return;
      }

      var formData = new FormData(form);
      var jsonData = {};
      formData.forEach(function(value, key) { jsonData[key] = value; });

      makeRequest('POST', '/api/book', jsonData, function(error, data) {
        btn.disabled = false;
        if (error) {
          alert(data && data.message || 'Booking failed: ' + error);
          console.error('Booking Error:', error);
          return;
        }
        if (data && data.success) {
          alert(data.message || 'Booking confirmed!');
          var modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
          modal.hide();
          form.reset();
          // Re-set initial dates for the next booking attempt
          form.booking_date.value = new Date().toISOString().split('T')[0];
          form.checkin_date.value = new Date().toISOString().split('T')[0];
          // Optionally reload the page to refresh booking list or similar
          window.location.reload(); 
        } else {
          alert(data.message || 'Booking failed');
          console.error('Booking Failed Data:', data);
        }
      });
    });
        document.getElementById('addYourReviewBtn').addEventListener('click', function() {
            const loggedInUsername = "<%= user ? user.username : '' %>";
            
            if (!loggedInUsername) {
                alert('Please log in to add a review.');
                window.location.href = '/login'; // Redirect to login if not logged in
                return; // Stop execution
            }

            // If logged in, proceed to show the review modal
            var reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
            reviewModal.show();
        });


        // Review Form Submission (No changes from previous fix)
        document.getElementById('reviewForm').addEventListener('submit', function (e) {
            e.preventDefault();

            const loggedInUsername = "<%= user ? user.username : '' %>";
            const loggedInUserId = "<%= user ? user.userid : '' %>"; 

            if (!loggedInUsername) { // This check is redundant now because of the button handler, but good as a fallback
                alert('Please log in to submit a review.');
                window.location.href = '/login'; 
                return;
            }

            const now = new Date();
            const formattedDate =
                now.getFullYear() + '-' +
                String(now.getMonth() + 1).padStart(2, '0') + '-' +
                String(now.getDate()).padStart(2, '0') + ' ' +
                String(now.getHours()).padStart(2, '0') + ':' +
                String(now.getMinutes()).padStart(2, '0') + ':' +
                String(now.getSeconds()).padStart(2, '0');

            document.getElementById('rev_date_add_review').value = formattedDate;

            const form = e.target;
            const formData = new FormData(form);
            const data = {};

            formData.forEach(function (value, key) {
                data[key] = value;
            });

            data.userid = loggedInUserId;

            console.log('Sending review data:', data);

            makeRequest('POST', '/api/submit-review', data, function(error, responseData) {
                console.log('Review submission response:', error, responseData);

                if (error) {
                    alert("❌ Failed to submit review: " + (responseData && responseData.message ? responseData.message : error));
                    console.error('Review submission error:', error, responseData);
                    return;
                }
                if (responseData && responseData.success) {
                    document.getElementById('thankYouMsg').classList.remove('d-none');
                    setTimeout(() => {
                        var modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
                        modal.hide();
                        form.reset();
                        document.getElementById('thankYouMsg').classList.add('d-none'); 
                        // window.location.reload(); // Uncomment if you want to refresh the page after review submit
                    }, 2000); 
                } else {
                    alert("❌ Failed to submit review: " + (responseData && responseData.message ? responseData.message : 'Unknown error'));
                }
            });
        });

        // View Previous Reviews Handler (No changes)
        document.getElementById('viewPreviousReviewsBtn').addEventListener('click', function() {
            const previousReviewsContent = document.getElementById('previous-reviews-content');

            previousReviewsContent.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-info" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-dark">Loading reviews...</p>
                </div>
            `;

            makeRequest('GET', '/api/reviews', null, function(error, data) {
                if (error) {
                    previousReviewsContent.innerHTML = '<p class="text-danger text-center py-4">Failed to load reviews. ' + (data && data.message ? data.message : error) + '</p>';
                    console.error('Error fetching reviews:', error, data);
                    return;
                }

                if (data && data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
                    let reviewsHtml = '<ul class="list-group">';
                    data.reviews.forEach(review => {
                        const reviewDate = review.rev_date ? new Date(review.rev_date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        }) : 'N/A';
                        const stars = '⭐'.repeat(review.rating || 0);

                        reviewsHtml += `
                            <li class="list-group-item mb-3 shadow-sm border rounded p-3">
                                <h6 class="mb-1 text-primary">Hotel: ${review.hotel_name || 'N/A'}</h6>
                                <p class="mb-1"><strong>Review ID:</strong> ${review.rev_id || 'N/A'}</p>
                                <p class="mb-1"><strong>Review:</strong> ${review.rev_text || 'No review text provided.'}</p>
                                <p class="mb-1"><strong>Rating:</strong> ${stars || 'N/A'}</p>
                                <p class="mb-0 text-muted small"><strong>Date:</strong> ${reviewDate}</p>
                            </li>
                        `;
                    });
                    reviewsHtml += '</ul>';
                    previousReviewsContent.innerHTML = reviewsHtml;
                } else {
                    previousReviewsContent.innerHTML = '<p class="text-muted text-center py-4">No previous reviews found.</p>';
                }
                var modal = new bootstrap.Modal(document.getElementById('previousReviewsModal'));
                modal.show();
            });
        });

        // Set initial check-in time on page load
        document.addEventListener('DOMContentLoaded', () => {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            document.getElementById('checkin_time').value = `${hh}:${mm}`;
        });




        makeRequest('POST', '/api/submit-review', data, function (error, responseData) {
  if (error) {
    alert('❌ Failed to submit review: ' + (responseData?.message || error));
    return;
  }

  if (responseData?.success) {
    // ✅ Review saved — show thank‑you / close modal
    document.getElementById('thankYouMsg').classList.remove('d-none');
    // … your success handling …
  } else {
    alert('❌ Failed to submit review: Unknown error');
  }
});

function makeRequest(method, url, data, cb) {
  const xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.withCredentials = true;                    // ⬅️ sends session cookie
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = function () {
    let json = {};
    try { json = JSON.parse(xhr.responseText || '{}'); } catch (_) {}

    /* ✅ any 2xx status is success */
    if (xhr.status >= 200 && xhr.status < 300) {
      cb(null, json);            // success
    } else {
      cb(xhr.status, json);      // error (non‑2xx)
    }
  };

  xhr.onerror = function () {
    cb('network‑error', null);   // network‑level failure
  };

  xhr.send(method === 'GET' ? null : JSON.stringify(data));
}
   
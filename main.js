document.addEventListener('DOMContentLoaded', function() {
    // Function to animate numbers
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            obj.innerHTML = current.toLocaleString() + (obj.id.includes('rate') ? '%' : (obj.id.includes('plus') ? '+' : ''));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (el.id === 'success-rate') {
                    animateValue(el, 0, 98, 1500);
                } else if (el.id === 'lives-saved') {
                    animateValue(el, 0, 50000, 1500);
                } else if (el.id === 'years-experience') {
                    animateValue(el, 0, 25, 1500);
                } else if (el.id === 'awards-won') {
                    animateValue(el, 0, 100, 1500);
                }
                observer.unobserve(el); // Stop observing after animation
            }
        });
    }, { threshold: 0.5 });

    // Observe the elements
    const successRate = document.getElementById('success-rate');
    const livesSaved = document.getElementById('lives-saved');
    const yearsExperience = document.getElementById('years-experience');
    const awardsWon = document.getElementById('awards-won');

    if(successRate) observer.observe(successRate);
    if(livesSaved) observer.observe(livesSaved);
    if(yearsExperience) observer.observe(yearsExperience);
    if(awardsWon) observer.observe(awardsWon);

    // Modal functionality
    const modal = document.getElementById('doctor-modal');
    const doctorCards = document.querySelectorAll('.doctor-card-page');
    const closeButton = document.querySelector('.close-button');

    if(doctorCards.length > 0 && modal) {
        doctorCards.forEach(card => {
            card.addEventListener('click', () => {
                const name = card.dataset.name;
                const specialty = card.dataset.specialty;
                const experience = card.dataset.experience;
                const bio = card.dataset.bio;

                document.getElementById('modal-doctor-name').textContent = name;
                document.getElementById('modal-doctor-specialty').textContent = specialty;
                document.getElementById('modal-doctor-experience').textContent = experience;
                document.getElementById('modal-doctor-bio').textContent = bio;

                modal.style.display = 'block';
            });
        });

        if(closeButton) {
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const currentlyActive = document.querySelector('.faq-item.active');
            if (currentlyActive && currentlyActive !== item) {
                currentlyActive.classList.remove('active');
            }
            item.classList.toggle('active');
        });
    });

    // Scroll reveal animation
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Animate form elements on the appointment page
    const form = document.querySelector('.appointment-form');
    if (form) {
        const formElements = form.querySelectorAll('.form-group, .btn');
        formElements.forEach((el, index) => {
            el.style.setProperty('--animation-delay', `${index * 100}ms`);
        });
    }

    // Animate form elements on the contact page
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        const formElements = contactForm.querySelectorAll('.form-group, .btn');
        formElements.forEach((el, index) => {
            el.style.setProperty('--animation-delay', `${index * 100}ms`);
        });
    }

    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const doctorName = document.getElementById('modal-doctor-name').textContent;
            const date = document.getElementById('booking-date').value;
            const time = document.getElementById('booking-time').value;

            const isBooked = await isSlotBooked(doctorName, date, time);

            if (isBooked) {
                alert('This time slot is already booked. Please choose another time.');
            } else {
                const appointment = {
                    doctor: doctorName,
                    date,
                    time,
                    patient: {
                        name: document.getElementById('patient-name').value,
                        email: document.getElementById('patient-email').value,
                        phone: document.getElementById('patient-phone').value,
                    },
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                await db.collection('appointments').add(appointment);
                alert('Appointment booked successfully!');
                bookingForm.reset();
            }
        });
    }

    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const doctorName = document.getElementById('doctor').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;

            const isBooked = await isSlotBooked(doctorName, date, time);

            if (isBooked) {
                alert('This time slot is already booked. Please choose another time.');
            } else {
                const appointment = {
                    doctor: doctorName,
                    date,
                    time,
                    patient: {
                        name: document.getElementById('name').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                    },
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                await db.collection('appointments').add(appointment);
                alert('Appointment booked successfully!');
                appointmentForm.reset();
            }
        });
    }

    async function isSlotBooked(doctor, date, time) {
        const snapshot = await db.collection('appointments')
            .where('doctor', '==', doctor)
            .where('date', '==', date)
            .where('time', '==', time)
            .get();
        return !snapshot.empty;
    }

    const bookingDate = document.getElementById('booking-date');
    const bookingTime = document.getElementById('booking-time');
    if (bookingDate && bookingTime) {
        bookingDate.addEventListener('change', () => {
            updateAvailableTimes(document.getElementById('modal-doctor-name').textContent, bookingDate.value, bookingTime);
        });
    }

    const apptDate = document.getElementById('date');
    const apptTime = document.getElementById('time');
    const apptDoctor = document.getElementById('doctor');
    if (apptDate && apptTime && apptDoctor) {
        apptDate.addEventListener('change', () => {
            updateAvailableTimes(apptDoctor.value, apptDate.value, apptTime);
        });
        apptDoctor.addEventListener('change', () => {
            updateAvailableTimes(apptDoctor.value, apptDate.value, apptTime);
        });
    }

    async function updateAvailableTimes(doctor, date, timeSelect) {
        if (!doctor || !date) {
            return;
        }

        const snapshot = await db.collection('appointments')
            .where('doctor', '==', doctor)
            .where('date', '==', date)
            .get();
        
        const bookedTimes = snapshot.docs.map(doc => doc.data().time);

        for (const option of timeSelect.options) {
            if (bookedTimes.includes(option.value)) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        }
    }
});

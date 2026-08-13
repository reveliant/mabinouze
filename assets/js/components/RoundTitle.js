import VueQr from 'vue-qr'
import {DateTime} from 'luxon';
import params from '@params'

export default {
    components: {
        VueQr,
    },
    props: {
        id: String,
        description: String,
        datetime: String,
        noQrcode: Boolean,
    },
    computed: {
        url() { return params.baseURL + this.id },
        day: function() {
            let now = DateTime.now()
            let day = DateTime.fromISO(this.datetime);
            
            // Same day
            if (day.hasSame(now, 'day'))
                return "aujourd'hui"
            
            // Future
            if (day > now) {
                // Same day as tomorrow
                if (day.hasSame(now.plus({ day: 1}), 'day'))
                    return "demain"
                // In the next 7 days
                if (day < now.plus({ day: 7 }))
                    return day.toFormat("cccc 'prochain'")
            }

            // Past
            if (day < now) {
                // Same day as yesterday
                if (day.hasSame(now.minus({ day: 1}), 'day'))
                    return "hier"
                // In the last 7 days
                if (day > now.minus({ day: 7 }))
                    return day.toFormat("cccc 'dernier'")
            }

            // Default display 
            return day.toFormat("cccc d MMM")
        },
        time: function() {
            return DateTime.fromISO(this.datetime).toFormat('t');
        }
    },
    template: `
        <div class="round-header" v-if="!noQrcode">
            <div class="round-motto">
                <div class="icon">🍻</div>
                <p class="title">Ta tournée t'attend</p>
                <p class="motto">Partage et scanne pour rejoindre la tournée !</p>
            </div>
            <div class="round-title">
                <p class="round-label">
                    <i class="bi bi-upc-scan me-1" aria-hidden="true"></i>
                    Nom de la tournée
                </p>
                <h2 class="round-cartouche" v-text="id"></h2>
            </div>
            <div class="round-time">
                <p class="round-label">
                    <i class="bi bi-clock me-1" aria-hidden="true"></i>
                    On se retrouve
                </p>
                <div class="round-cartouche">
                    <span class="fw-bolder" v-text="day"></span> 
                    <span>à</span>
                    <span class="fw-bolder" v-text="time"></span>
                </div>
            </div>
            <div class="round-qrcode">
                <vue-qr :text="url" :size="150" :margin="16" :correctLevel="3" logoSrc="/dropcap.svg" :logoMargin=5 class="rounded" />
            </div> 
        </div>
        <h3 class="h1 mt-2 mb-3" v-text="description" v-if="!noQrcode"></h3>
        <h2 class="d-flex justify-content-between align-items-center mb-3" v-if="noQrcode">
            <div class="d-flex flex-column">
                <span class="text-primary font-monospace" v-text="id"></span>
                <span v-text="description"></span>
            </div>
            <div class="calendar">
                <span class="calendar-day" v-text="day"></span>
                <span class="calendar-time" v-text="time"></span>
            </div>
        </h2>
    `
}
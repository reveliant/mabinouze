import Calendar from './Calendar.js'

export default {
    components: {
        Calendar,
    },
    props: {
        id: String,
        description: String,
        time: String,
    },
    template: `
        <h2 class="d-flex align-items-center">
            <div class="d-flex flex-column">
                <span class="text-primary font-monospace" v-text="id"></span>
                <span v-text="description"></span>
            </div>
            <calendar class="ms-auto" :date="time"></calendar>
        </h2>
    `
}
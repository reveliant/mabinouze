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
                <tt class="text-primary" v-text="id"></tt>
                <span v-if="description" v-text="description"></span>
            </div>
            <calendar class="ms-auto" :date="time"></calendar>
        </h2>
    `
}
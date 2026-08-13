import axios from 'axios';

export default {
    props: {
        id: String,
        name: String,
        quantity: Number,
        config: Object,
        edit: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        add() {
            this.update(this.quantity + 1);
        },
        remove() {
            this.update(this.quantity - 1);
        },
        update(quantity) {
            axios.put(this.urls.drink + '/' + this.id, {
                name: this.name,
                quantity: quantity
            }, this.config).then((response) => {
                this.emitter.emit('updateOrder')
            }).catch((error) => {
                this.emitter.emit('errorUpdateOrder', error)
            })
        },
    },
    template: `
        <li class="d-flex justify-content-between align-items-center mb-2">
            <span class="me-2">{{ quantity }}×</span>
            <span class="flex-fill">{{ name }}</span>
            <button class="btn btn-outline-primary btn-circle ms-3" @click="remove()" v-show="edit"><i class="bi bi-dash"></i></button>
            <button class="btn btn-outline-primary btn-circle ms-2" @click="add()" v-show="edit"><i class="bi bi-plus"></i></button>
        </li>
    `
}
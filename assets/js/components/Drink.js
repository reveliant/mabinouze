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
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span class="flex-fill">{{ name }}</span>
            <span class="badge bg-danger rounded-pill" v-if="quantity > 1">{{ quantity }}</span>
            <button class="list-group-item-add btn btn-danger badge ms-3" @click="remove()" v-show="edit">&ndash;</button>
            <button class="list-group-item-add btn btn-success badge ms-1" @click="add()" v-show="edit">+</button>
        </li>
    `
}
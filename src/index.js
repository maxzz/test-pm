Vue.component('child', {
    template: `
        <div>
            <button v-on:click="emit">Clique me to emit from child component</button>
        </div>
    `,
    methods: {
        emit: function() {
            this.$emit('event_child', 1);
        }
    }
});

const formsData = {
    formA: {
        label: 'Password Change 1',
        fields: [
            {
                type: 'password',
                placeholder: "password new",
            },
            {
                type: 'password',
                placeholder: "password confirm",
            },
        ]
    },
    formB: {
        label: 'Password Change 2',
        fields: [
            {
                type: 'password',
                placeholder: "password current",
            },
            {
                type: 'password',
                placeholder: "password new",
            },
        ]
    },
    formC: {
        label: 'Password Change 3',
        fields: [
            {
                type: 'password',
                placeholder: "password current",
            },
            {
                type: 'password',
                placeholder: "password new",
            },
            {
                type: 'password',
                placeholder: "password confirm",
            },
        ]
    },
};

Vue.component('test-form', {
    template: '#test-template',
    data: function() {
        return {
            formId: '',
            name: '',
        };
    },
    mounted() {
        this.formId = this.$el.dataset['formId'];
        
        let form = formsData[this.formId];
        this.name = form.label;
        form.fields.forEach(_ => this.addField(_));
    },
    methods: {
        addField(attrs) {
            let formEl = this.$el.querySelector('form');
            let all = [...formEl.querySelectorAll('input')];
            let last = all[all.length - 1] ? all[all.length - 1].nextElementSibling : formEl.firstElementChild;

            let el = document.createElement('input');
            Object.keys(attrs).forEach(_ => el.setAttribute(_, attrs[_]));
            formEl.insertBefore(el, last);
        },
    },
});

var vm = new Vue({
    el: '#app',
    created() {
        this.$on('event_parent', function(id) {
            console.log('Event from parent component emitted', id);
        });
    },
    data: function() {
        return {
            msg: 'hello vue',
            id: ''
        };
    },
    methods: {
        eventChild: function(id) {
            console.log('Event from child component emitted', id);
        },
        eventParent: function() {
            this.$emit('event_parent', 1);
        }
    }
});

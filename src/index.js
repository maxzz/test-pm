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

const formsData = [
    {
        formName: 'name',
        fields: [
            {
                attrs: {
                    type: 'password',
                    placeholder: "password current",
                }
            },
            {
                attrs: {
                    type: 'password',
                    placeholder: "password current",
                }
            },
            {
                attrs: {
                    type: 'password',
                    placeholder: "password current",
                }
            },
        ]
    }
];

Vue.component('test-form', {
    template: '#test-template',
    data: function() {
        return {
            name: '',
        };
    },
    mounted() {
        this.name = 'aaa';
        console.log('mo', this.$el);

        this.addField({
            type: 'password',
            placeholder: "password current",
        });
        this.addField({
            type: 'password',
            placeholder: "password new",
        });
        this.addField({
            type: 'password',
            placeholder: "password confirm",
        });
    },
    methods: {
        addField(attrs) {
            let all = [...this.$el.querySelectorAll('input')];
            let last = all[all.length - 1] ? all[all.length - 1].nextElementSibling : this.$el.firstElementChild;

            let el = document.createElement('input');
            this.setAttrs(el, attrs);
            this.$el.insertBefore(el, last);
        },
        setAttrs(el, attrs) {
            Object.keys(attrs).forEach(_ => el.setAttribute(_, attrs[_]));
        }
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

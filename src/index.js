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
        label: 'Change: New+New',
        fields: [
            {
                type: 'password',
                placeholder: "Password New",
            },
            {
                type: 'password',
                placeholder: "Password Confirm",
            },
        ]
    },
    formB: {
        label: 'Change: Cur+New',
        fields: [
            {
                type: 'password',
                placeholder: "Password Current",
                name: 'current-password',
            },
            {
                type: 'password',
                placeholder: "Password New",
            },
        ]
    },
    formC: {
        label: 'Change Cur+New+New',
        fields: [
            {
                type: 'password',
                placeholder: "Password Current",
            },
            {
                type: 'password',
                placeholder: "Password New",
            },
            {
                type: 'password',
                placeholder: "Password Confirm",
            },
        ]
    },
};

function setAttrs(el, attrs) {
    Object.keys(attrs).forEach(_ => el.setAttribute(_, attrs[_]));
}

Vue.component('test-form', {
    template: '#test-template',
    data: function() {
        return {
            formId: '',
            name: '',

            opt_hasUsername: false,
            opt_hasLogin: false,
            opt_fillValid: true,
        };
    },
    mounted() {
        this.formId = this.$el.dataset['formId'];
        
        let form = formsData[this.formId];
        this.name = form.label;
        form.fields.forEach(_ => this.addField(_));
    },
    watch: {
        opt_hasUsername: function(value) {
            console.log('value', value);
            this.addUsername(value);
        }
    },
    methods: {
        addUsername(add) {
            let formEl = this.$el.querySelector('.form-fields');
            let all = [...formEl.querySelectorAll('input:not([type=checkbox])')];
            let usernameEl = all && all[0];
            if (usernameEl) {
                !usernameEl.classList.contains('username') && (usernameEl = null);
            }
            if (add) {
                if (!usernameEl) {
                    let el = document.createElement('input');
                    setAttrs(el, {
                        type: 'text',
                        'class': 'username',
                        placeholder: 'User name'

                    });
                    formEl.insertBefore(el, formEl.firstElementChild);
                }
            } else {
                if (usernameEl) {
                    formEl.removeChild(usernameEl);
                }
            }
        },
        addField(attrs) {
            let formEl = this.$el.querySelector('.form-fields');
            let all = [...formEl.querySelectorAll('input:not([type=checkbox])')];
            let last = all[all.length - 1] ? all[all.length - 1].nextElementSibling : formEl.firstElementChild;

            let el = document.createElement('input');
            setAttrs(el, attrs);
            formEl.insertBefore(el, last);
        },
        fillValues() {
            let all = [...this.$el.querySelectorAll('input')];
            all.forEach((_, index) => {
                _.value = `____ ${index} ____`;
            });
        },
        clearValues() {
            let all = [...this.$el.querySelectorAll('input')];
            all.forEach(_ => {
                _.value = '';
            });
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

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
    'formA-nn': {
        label: 'Change: New+New',
        fields: [
            {
                type: 'password',
                placeholder: "Password New",
                name: 'password-new',
                autocomplete: 'new-password',
                'data-ftype': 1 // new
            },
            {
                type: 'password',
                placeholder: "Password Confirm",
                name: 'password-confirm',
                autocomplete: 'new-password',
                'data-ftype': 1 // new
            },
            {
                type: 'hidden',
                name: 'username',
                autocomplete: 'username',
                value: 'maxzz',
                'data-ftype': -1
            },
        ]
    },
    'formB-cn': {
        label: 'Change: Cur+New',
        fields: [
            {
                type: 'password',
                placeholder: "Password Current",
                name: 'password-current',
                autocomplete: 'current-password',
                'data-ftype': 0 // old
            },
            {
                type: 'password',
                placeholder: "Password New",
                name: 'password-new',
                autocomplete: 'new-password',
                'data-ftype': 1 // new
            },
            {
                type: 'hidden',
                name: 'username',
                value: 'maxzz',
                'data-ftype': -1
            },
        ]
    },
    'formC-cnn': {
        label: 'Change Cur+New+New',
        fields: [
            {
                type: 'password',
                placeholder: "Password Current",
                name: 'password-current', // <- always current
                autocomplete: 'current-password',
                'data-ftype': 0 // old
            },
            {
                type: 'password',
                placeholder: "Password New",
                name: 'password-new',
                autocomplete: 'new-password',
                'data-ftype': 1 // new
            },
            {
                type: 'password',
                placeholder: "Password Confirm",
                name: 'password-confirm',
                autocomplete: 'new-password',
                'data-ftype': 1 // new
            },
            {
                type: 'hidden',
                name: 'username',
                value: 'maxzz',
                'data-ftype': -1
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
            formLabel: '',

            field_username: '',
            fields: [],

            opt_hasUsername: false,
            opt_hasLogin: true,
            opt_fillInvalid: false,

            fillin: [] // fill-values: 0 - old; 1 - new
        };
    },
    mounted() {
        this.formId = this.$el.dataset['formId'];

        let form = formsData[this.formId];
        form.fields.forEach(_ => _.value = ''); // add value
        this.fields = formsData[this.formId].fields;
        this.formLabel = form.label;
        this.fillin = form.fields.map(_ => _['data-ftype']);

        //form.fields.forEach(this.addField);
    },
    watch: {
        opt_hasUsername: function(value) {
        }
    },
    methods: {
        /*
        addField(attrs) {
            let formEl = this.$el.querySelector('.form-fields');
            let all = [...formEl.querySelectorAll('input:not([type=checkbox])')];
            let last = all[all.length - 1] ? all[all.length - 1].nextElementSibling : formEl.firstElementChild;

            let el = document.createElement('input');
            setAttrs(el, attrs);
            formEl.insertBefore(el, last);
        },
        */
        fillValues() {
            let all = [...this.$el.querySelectorAll('.form-fields input')];
            all.forEach((_, index) => _.value = `____ ${this.fillin[index]} ____`);
        },
        clearValues() {
            let all = [...this.$el.querySelectorAll('.form-fields input')];
            all.forEach(_ => _.value = '');
        },
    },
});

const STORAGE_CURRENT = 'd16-pchange-data';
const STORAGE_VAULT = 'd16-pchange-vault';

Vue.component('hidden-data-form', {
    template: '#hidden-data-form',
    data: () => {
        return {
            lastIndex: 10,
            loadingLocalStorage: false,
            fields: [],
            vault: [],
        };
    },
    created() {
        this.loadLocalStorage();
        this.loadVault();
    },
    methods: {
        /* Fields */
        parseFieldsFromString(cnt) {
            try {
                cnt = cnt && JSON.parse(cnt) || [];
            } catch(err) {
                cnt = [];
            }
            cnt.forEach(_ => _.idx = this.lastIndex++);
            return cnt;
        },
        loadLocalStorage() {
            this.loadingLocalStorage = true;
            let cnt = localStorage.getItem(STORAGE_CURRENT);
            this.fields = this.parseFieldsFromString(cnt);
        },
        saveFieldsToLocalStorage() {
            let cnt = JSON.stringify(this.fields);
            localStorage.setItem(STORAGE_CURRENT, cnt);
        },
        onAddField() {
            this.fields.push({
                value: `data ${this.lastIndex}`,
                password: false,
                idx: this.lastIndex++,
            });
        },
        onDelField(idx) {
            let newFields = this.fields.filter(_ => _.idx != idx);
            this.fields = newFields; 
        },
        /* Vault */
        loadVault() {
            let vault = localStorage.getItem(STORAGE_VAULT);
            vault = JSON.parse(vault || []);
            vault.forEach(_ => _.idx = this.lastIndex++);
            this.vault = vault;
        },
        vaultItemDispText(vaultItem) {
            let cnt = JSON.parse(vaultItem || '[]');
            return cnt.reduce((acc, _) => acc += `${_.value}${_.password?'***':''} `, '');
        },
        onAddToVault() {
            this.vault = [{
                data: JSON.stringify(this.fields),
                idx: this.lastIndex++,
            }, ...this.vault];
            localStorage.setItem(STORAGE_VAULT, JSON.stringify(this.vault));
        },
        onDelFromVault(idx) {
            this.vault = this.vault.filter(_ => _.idx !== idx);
        },
        onSetFieldsFromVault(data) {
            this.fields = this.parseFieldsFromString(data);
        },
    },
    watch: {
        fields: {
            handler(val, old) {
                if (this.loadingLocalStorage) {
                    this.loadingLocalStorage = false;
                } else {
                    this.saveFieldsToLocalStorage();
                }
            },
            deep: true
        }
    }
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

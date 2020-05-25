Vue.use(window.vueCompositionApi.default);
const { ref, reactive, toRefs, onMounted, watch } = window.vueCompositionApi;

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

Vue.component('i-lock', {
    template: `
    <svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M18 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v4h-3v14h18v-14h-3zm-10 0v-4c0-2.206 1.794-4 4-4s4 1.794 4 4v4h-8z"/>
    </svg>
    `
});
Vue.component('i-text', {
    template: `
    <svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M24 20v1h-4v-1h.835c.258 0 .405-.178.321-.422l-.473-1.371h-2.231l-.575-1.59h2.295l-1.362-4.077-1.154 3.451-.879-2.498.921-2.493h2.222l3.033 8.516c.111.315.244.484.578.484h.469zm-6-1h1v2h-7v-2h.532c.459 0 .782-.453.633-.887l-.816-2.113h-6.232l-.815 2.113c-.149.434.174.887.633.887h1.065v2h-7v-2h.43c.593 0 1.123-.375 1.32-.935l5.507-15.065h3.952l5.507 15.065c.197.56.69.935 1.284.935zm-10.886-6h4.238l-2.259-6.199-1.979 6.199z"/>
    </svg>
    `
});

Vue.component('i-what', {
    template: `
        <i-lock v-if="!!psw"></i-lock>
        <i-text v-else></i-text>
    `,
    props: ['psw']
});

const formsData = [
    {
        formId: 'formA-nn',
        label: 'Change: New+New',
        fields: [
            {
                type: 'password',
                placeholder: "Password New",
                name: 'password-new',
                autocomplete: 'new-password',
                dataFtype: 1 // new
            },
            {
                type: 'password',
                placeholder: "Password Confirm",
                name: 'password-confirm',
                autocomplete: 'new-password',
                dataFtype: 1 // new
            },
            {
                type: 'hidden',
                name: 'username',
                autocomplete: 'username',
                value: 'maxzz',
                dataFtype: -1
            },
        ]
    },
    {
        formId: 'formB-cn',
        label: 'Change: Cur+New',
        fields: [
            {
                type: 'password',
                placeholder: "Password Current",
                name: 'password-current',
                autocomplete: 'current-password',
                dataFtype: 0 // old
            },
            {
                type: 'password',
                placeholder: "Password New",
                name: 'password-new',
                autocomplete: 'new-password',
                dataFtype: 1 // new
            },
            {
                type: 'hidden',
                name: 'username',
                autocomplete: 'username',
                value: 'maxzz',
                dataFtype: -1
            },
        ]
    },
    {
        formId: 'formC-cnn',
        label: 'Change Cur+New+New',
        fields: [
            {
                type: 'password',
                placeholder: "Password Current",
                name: 'password-current', // <- always current
                autocomplete: 'current-password',
                dataFtype: 0 // old
            },
            {
                type: 'password',
                placeholder: "Password New",
                name: 'password-new',
                autocomplete: 'new-password',
                dataFtype: 1 // new
            },
            {
                type: 'password',
                placeholder: "Password Confirm",
                name: 'password-confirm',
                autocomplete: 'new-password',
                dataFtype: 1 // new
            },
            {
                type: 'hidden',
                name: 'username',
                autocomplete: 'username',
                value: 'maxzz',
                dataFtype: -1
            },
        ]
    },
];

function setAttrs(el, attrs) {
    Object.keys(attrs).forEach(_ => el.setAttribute(_, attrs[_]));
}

const STORAGE_TESTFORM = 'd16-pchange-test-form';

Vue.component('test-form', {
    template: '#test-template',
    props: ['formName'],
    setup(props, ctx) {

        /*
        type Field = {
            type: 'password' | 'hidden',
            placeholder: string;
            name: 'password-current' | 'password-new' | 'password-confirm' | 'username';
            autocomplete: 'username' | 'new-password' | 'current-password';
            value?: string;
            dataFtype: 0 | 1 | -1; // 0 = old | 1 = new | -1 = username
        }
        */
        const dataa = reactive({
            formId: '',
            formLabel: '',
            loading: true,

            fillin: [], // fill-values: 0 - old; 1 - new

            watching: {
                field_username: '',
                fields: [], // Field[]

                options: {
                    hasUsername: false,
                    hasLogin: true,
                    fillInvalid: false,
                    showPsws: false,
                },
            },
        });

        function localStorageLoad() {
            let cnt = localStorage.getItem(`${STORAGE_TESTFORM}-${dataa.formId}`);
            let s = cnt && JSON.parse(cnt);
            if (s) {
                dataa.watching.field_username = s.field_username;
                dataa.watching.fields.map((_, index) => _.value = s.fields[index]),
                dataa.watching.options = s.options;
            }
        }
        function localStorageSave() {
            let s = {
                field_username: dataa.watching.field_username,
                fields: dataa.watching.fields.map(_ => _.value),
                options: dataa.watching.options,
            };
            localStorage.setItem(`${STORAGE_TESTFORM}-${dataa.formId}`, JSON.stringify(s));
        }

        function fieldType(field) {
            return field.type === 'hidden' ? 'hidden' : dataa.watching.options.showPsws ? 'text' : field.type;
        }
        function onFillValues() {
            dataa.watching.fields.forEach((_, index) => {
                if (dataa.fillin[index] >= 0) {
                    let numb = dataa.fillin[index] + (dataa.watching.options.fillInvalid ? index : 0); // add index as shift to do invalid value
                    _.value = `____ ${numb} ____`;
                }
            });
        }
        function onClearValues() {
            dataa.watching.fields.forEach((_, index) => dataa.fillin[index] >= 0 && (_.value = ''));
        }

        onMounted(() => {
            dataa.formId = props.formName;

            let org = formsData.find((_) => _.formId === dataa.formId);

            org.fields.forEach(_ => !_.value && (_.value = ''));
    
            dataa.formLabel = org.label;
            dataa.watching.fields = org.fields;
            dataa.fillin = org.fields.map(_ => _.dataFtype);
    
            dataa.loading = true;
            localStorageLoad();
        });

        watch(() => dataa.watching, () => dataa.loading ? (dataa.loading = false) : localStorageSave(), {deep: true});

        return {
            ...toRefs(dataa),
            fieldType,
            onFillValues,
            onClearValues,
        };
    }
});

const STORAGE_CURRENT = 'd16-pchange-data';
const STORAGE_VAULT = 'd16-pchange-vault';

Vue.component('data-forms', {
    template: '#data-forms',
    setup(props, ctx) {
        const data = reactive({
            lastIndex: 10,
            loading: true,
            fields: [],
            vault: [],
        });

        onMounted(() => {
            function loadLocalStorage() {
                data.loading = true;
                let cnt = localStorage.getItem(STORAGE_CURRENT);
                data.fields = parseFieldsFromString(cnt);
            }
            function loadVault() {
                let vault = localStorage.getItem(STORAGE_VAULT);
                vault = JSON.parse(vault || '[]');
                vault.forEach(_ => _.idx = data.lastIndex++);
                data.vault = vault;
            }

            loadLocalStorage();
            loadVault();
        });

        watch(() => data.fields, () => data.loading ? (data.loading = false) : saveFieldsToLocalStorage(), { deep: true });

        /* Fields */
        function parseFieldsFromString(cnt) {
            try {
                cnt = cnt && JSON.parse(cnt) || [];
            } catch(err) {
                cnt = [];
            }
            cnt.forEach(_ => _.idx = data.lastIndex++);
            return cnt;
        }
        function saveFieldsToLocalStorage() {
            let cnt = JSON.stringify(data.fields);
            localStorage.setItem(STORAGE_CURRENT, cnt);
        }
        function onAddField() {
            data.fields.push({
                value: `data ${data.lastIndex}`,
                password: false,
                idx: data.lastIndex++,
            });
        }
        function onDelField(idx) {
            let newFields = data.fields.filter(_ => _.idx != idx);
            data.fields = newFields; 
        }

        /* Vault */
        function vaultItemDispText(vaultItem) {
            let cnt = JSON.parse(vaultItem || '[]');
            return cnt.reduce((acc, _, i) => acc += `${!i?'':' + '}${_.password?'\uD83D\uDD12':''}'${_.value}'`, '');
        }
        function onAddToVault() {
            data.vault = [{
                data: JSON.stringify(data.fields),
                idx: data.lastIndex++,
            }, ...data.vault];
            localStorage.setItem(STORAGE_VAULT, JSON.stringify(data.vault));
        }
        function onDelFromVault(idx) {
            data.vault = data.vault.filter(_ => _.idx !== idx);
        }
        function onSetFieldsFromVault(str) {
            data.fields = parseFieldsFromString(str);
        }

        return {
            ...toRefs(data),
            /* Fields */
            onAddField,
            onDelField,
            /* Vault */
            vaultItemDispText,
            onAddToVault,
            onDelFromVault,
            onSetFieldsFromVault,
        };
    }
});

function main(ctx) {
    console.log('start');

    const userForms = ref([
        'formA-nn',
        'formB-cn',
        'formC-cnn',
    ]);

    return {
        userForms,
    };
}

var vm = new Vue({
    el: '#app',
    setup(ctx) {
        return main(ctx);
    }
});

//console.log('api', window.vueCompositionApi);

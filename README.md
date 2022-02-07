# lknpd-nalog-api
API для самозанятых в РФ «Мой налог»

Автоматизирует отправку чеков в налоговую и другие операции. Используетcя непубличный API с сайта lknpd.nalog.ru

## Установка

The package can be installed via [npm](https://github.com/npm/cli):

```
npm install lknpd-nalog-api --save
```

## Использование

1. Импортируем класс NalogApi.
2. Создаем экземпляр с передачей параметров авторизации.
3. Вызываем нужные методы.

Пример:

```js
const { NalogApi } = require("lknpd-nalog-api");

const nalogApi = new NalogApi({ phone: 79101112222 });
// или
const nalogApi = new NalogApi({ inn: 1234567890, password: "myPassword" });

const income = {
  name: "Тестовый платеж",
  amount: 1999.99,
  quantity: 1,
};

nalogApi
  .addIncome(income)
  .then(receiptId => console.log(receiptId))
  .catch(error => console.log(error));
```

### Авторизация и параметры для конструктора

Вы должны быть зарегистрированы как самозанятый и у вас должна быть учетная запись в приложении «Мой налог» или на сайте [lknpd.nalog.ru](https://lknpd.nalog.ru).
Передаем в качестве параметров конструктора объект с данными. Есть два варианта авторизации: 

1) По номеру телефона:

```js
const nalogApi = new NalogApi({ phone: 79101112222 });
```

| Prop  | Type | Description |
| ----- | ---- | ----------- |
| phone | String \| Number | Телефон, к которому привязана учетка в налоговой |

После запуска скрипта на ваш телефон будет отправлено SMS с кодом, который нужно будет ввести в терминале. Код живет всего 3 минуты. Если SMS по каким-то причинам не пришла или пришла, но поздно, перезапустите скрипт. Следите чтобы процесс не падал на сервере, иначе нужно будет снова вводить код. По этой причине надежнее будет использовать второй способ авторизации.

2) По ИНН и паролю:

```js
const nalogApi = new NalogApi({ inn: 1234567890, password: "myPassword" });
```

| Prop  | Type                        | Description     |
| ----- | --------------------------- | --------------- |
| inn   | String \| Number | Ваш ИНН |
| password | String | Ваш пароль (узнать можно в налоговой)|

### Методы API

Экземпляр класса NalogApi содержит:

| Name   | Description  | Params |
| ----------- | --------------- |-----------|
| getUserInfo  | Возвращает данные о самозанятом  | ------------| 
| addIncome   | Отправляет чек в налоговую | IServiceIncome \|  IServiceIncome[], Date (необязательно, по умолчанию текущая отметка времени) |
| cancelIncome | Отменяет чек | receiptId: String - идентификатор чека |
| getApprovedIncome | Возвращает информацию о чеке | receiptId: String - идентификатор чека, format - "json" \| "print" (по умолчанию "json", "print" вернет Blob) 
| callMethod | Вызов произвольного метода* | methodPath - путь метода, body - тело запроса (если не передавать, будет GET, иначе POST)|

Объект параметров чека для addIncome. Метод принимает как один объект, так и массив объектов. Это не добавление нескольких чеков за раз, просто в одном чеке может быть несколько услуг или товаров.
```js
interface IServiceIncome {
  name: string // название услуги
  amount: number | string // сумма - 00.00 | 00 | "00.00" | "00"
  quantity: number // количество (в чеке не отображается)
}
```

\***callMethod** позволяет обратится к любому методу API со своими параметрами. Если необходимо то, чего нет в библиотеке, идем на сайт lknpd.nalog.ru, отлавливаем url запроса при нужных действиях, оттуда берем путь и параметры.


## License

The MIT License.

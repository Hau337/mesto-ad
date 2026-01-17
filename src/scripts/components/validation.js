/* показывает ошибку под полем ввода */
function showFieldError(form, field, config) {
  const errorElement = form.querySelector(`#${field.id}-error`);
  let message = field.validationMessage;

  /* при несоответствии паттерну и наличии ошибки - кастомное сообщение */
  if (field.validity.patternMismatch && field.dataset.errorMessage) {
    message = field.dataset.errorMessage;
  }

  errorElement.textContent = message;
  errorElement.classList.add(config.errorClass);
  field.classList.add(config.inputErrorClass);
}

/* скрывает ошибку под полем ввода */
function hideFieldError(form, field, config) {
  const errorElement = form.querySelector(`#${field.id}-error`);
  errorElement.textContent = '';
  errorElement.classList.remove(config.errorClass);
  field.classList.remove(config.inputErrorClass);
}

/* проверяет валидность одного поля и обновляет отображение ошибки */
function validateSingleInput(form, field, config) {
  if (field.validity.valid) {
    hideFieldError(form, field, config);
  } else {
    showFieldError(form, field, config);
  }
}

/* проверяет, есть ли хотя бы одно невалидное поле */
function isFormInvalid(inputs) {
  return inputs.some((input) => !input.validity.valid);
}

/* делает кнопку отправки неактивной */
export function disableButton(button, config) {
  button.disabled = true;
  button.classList.add(config.inactiveButtonClass);
}

/* делает кнопку отправки активной */
export function enableButton(button, config) {
  button.disabled = false;
  button.classList.remove(config.inactiveButtonClass);
}

/* обновляет состояние кнопки в зависимости от валидации формы */
function syncSubmitButtonState(inputs, button, config) {
  if (isFormInvalid(inputs)) {
    disableButton(button, config);
  } else {
    enableButton(button, config);
  }
}

/* настраивает слушатели событий на все поля формы */
function setupFormValidation(form, config) {
  const inputList = Array.from(form.querySelectorAll(config.inputSelector));
  const submitButton = form.querySelector(config.submitButtonSelector);

  /* устанавливаем начальное состояние кнопки */
  syncSubmitButtonState(inputList, submitButton, config);

  inputList.forEach((input) => {
    input.addEventListener('input', () => {
      validateSingleInput(form, input, config);
      syncSubmitButtonState(inputList, submitButton, config);
    });
  });
}

/*
очищает все ошибки валидации в форме и деактивирует кнопку
используется, например, при открытии редактирования
*/
export function clearValidation(formElement, settings) {
  const inputs = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const button = formElement.querySelector(settings.submitButtonSelector);

  inputs.forEach((input) => {
    hideFieldError(formElement, input, settings);
  });

  disableButton(button, settings);
}

/* включает валидацию для всех форм, соответствующих селектору */
export function enableValidation(settings) {
  const forms = document.querySelectorAll(settings.formSelector);
  forms.forEach((form) => setupFormValidation(form, settings));
}
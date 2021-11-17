(function() {
  const FormBuilder = {
    /**
     * Check document readyState for script load
     */
    init() {
      if (document.readyState !== 'loading') {
        this.load();
      } else {
        this.listen(window, 'load', this.load.bind(this));
      }
    },

    /**
     * Adds an eventListener to the element
     * @param element Element to attach event listener
     * @param evtName Name of event
     * @param cb Callback function of event listener
     */
    listen(element: Element, evtName: string, cb: any) {
      if (document.addEventListener) {
        element.addEventListener(evtName, cb);
      } else {
        (<any>element).attachEvent(`on${evtName}`, cb);
      }
    },

    /**
     * Selects all classes and maps nodes to get form id
     */
    load() {
      const elements = Array.from(document.querySelectorAll('.shuttle-form'));
      if (elements.length) {
        elements.map(el => this.getId(el));
      }
    },

    /**
     * Gets the data attribute of the element
     * @param element Current form element
     */
    getId(element: Element) {
      const id = element.getAttribute('data-id');
      if (id) {
        this.get(id, element);
      }
    },

    /**
     * Grabs the form from S3 based on the ID
     * @param id Id of the form
     * @param target Found element on the page
     */
    get(id: string, target: Element) {
      const request = new XMLHttpRequest();
      request.open('get', `https://s3.amazonaws.com/shuttle-STAGE_URL-forms/forms/${id}/form.html`);

      request.onload = () => {
        if (request.status === 200) {
          this.set(request.response, target);
        } else {
          console.error(`Form didn't load; error: ${request.statusText}`);
        }
      };
      request.onerror = () => console.error('Network error');
      request.send();
    },

    /**
     * Appends the requested form to the target div
     * @param form HTML of the form
     * @param target Node element to insert form
     */
    set(form: string, target: Element) {
      const node = document.createRange().createContextualFragment(form);
      target.appendChild(node);
    },
  };

  /**
   * Initialize Formbuilder script
   */
  FormBuilder.init();
})();

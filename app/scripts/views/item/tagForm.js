/* global define */
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'models/tag',
    'text!tagFormTempl',
    'Mousetrap'
], function(_, $, Backbone, Marionette, Tag, Template, Mousetrap) {
    'use strict';

    /**
     * Tags form
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        className: 'modal-dialog',

        ui: {
            name : 'input[name="name"]'
        },

        events: {
            'submit .form-horizontal': 'save',
            'click .ok'               : 'save',
            'click .cancelBtn'        : 'close'
        },

        initialize: function () {
            this.on('hidden', this.redirect);
            this.on('shown', this.onFormShown);
            Mousetrap.reset();
        },

        onFormShown: function () {
            this.ui.name.focus();
        },

        serializeData: function () {
            var model;

            if (this.model === undefined) {
                model = new this.options.collection.model();
            } else {
                model = this.model;
            }

            return _.extend(model.toJSON(), {
                tags: this.options.collection.toJSON()
            });
        },

        save: function (e) {
            if (e.$el === undefined) {
                e.preventDefault();
            } else {
                e.preventClose();
            }

            var data = {
                name: this.ui.name.val()
            };

            if (this.model !== undefined) {
                return this.update(data);
            } else {
                return this.create(data);
            }
        },

        /**
         * Update existing tag
         */
        update: function (data) {
            var that = this;

            this.model.set('name', data.name);

            // Handle validation errors
            this.model.on('invalid', function (model, errors) {
                that.showErrors(errors);
            });

            var result = this.model.save({}, {validate: true});
            if (result) {
                this.redirect();
            }
        },

        /**
         * Create new tag
         */
        create: function (data) {
            data.id = this.collection.nextOrder();

            var tag = new Tag(data, {validate: true});

            if ( !tag.validationError) {
                this.collection.create(tag);
                return this.redirect();
            } else {
                this.showErrors(tag.validationError);
            }
        },

        /**
         * Redirect
         */
        redirect: function () {
            return Backbone.history.navigate('#/notebooks', true);
        },

        /**
         * Close
         */
        close: function (e) {
            if (e !== undefined) {
                e.preventDefault();
            }
            this.trigger('close');
        },

        /**
         * Shows validation errors
         */
        showErrors: function(errors) {
            var that = this;
            _.each(errors, function( e) {
                if (e === 'name') {
                    that.$('#notebook-name').addClass('has-error');
                    that.ui.name.attr('placeholder', 'Tag name is required');
                }
            });
        }
    });

    return View;
});
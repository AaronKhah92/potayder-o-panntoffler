
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next, lookup.has(block.key));
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.21.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const route = writable({});
    const routes = writable([]);

    const beforeUrlChange = {
      _hooks: [],
      subscribe(listener) {
        const hooks = this._hooks;
        const index = hooks.length;
        listener(callback => { hooks[index] = callback; });
        return () => delete hooks[index]
      }
    };

    /** HELPERS */
    const url = {
      subscribe(listener) {
        return derived(getContext('routify'), context => context.url).subscribe(
          listener
        )
      },
    };

    function _isActive(url, route) {
      return function (path, keepIndex = true) {
        path = url(path, null, keepIndex);
        const currentPath = url(route.path, null, keepIndex);
        const re = new RegExp('^' + path);
        return currentPath.match(re)
      }
    }

    function _goto(url) {
      return function goto(path, params, _static, shallow) {
        const href = url(path, params);
        if (!_static) history.pushState({}, null, href);
        else getContext('routifyupdatepage')(href, shallow);
      }
    }

    function _url(context, route, routes) {
      return function url(path, params, preserveIndex) {
        path = path || './';

        if (!preserveIndex) path = path.replace(/index$/, '');

        if (path.match(/^\.\.?\//)) {
          //RELATIVE PATH
          // get component's dir
          let dir = context.path;
          // traverse through parents if needed
          const traverse = path.match(/\.\.\//g) || [];
          traverse.forEach(() => {
            dir = dir.replace(/\/[^\/]+\/?$/, '');
          });

          // strip leading periods and slashes
          path = path.replace(/^[\.\/]+/, '');
          dir = dir.replace(/\/$/, '') + '/';
          path = dir + path;
        } else if (path.match(/^\//)) ; else {
          // NAMED PATH
          const matchingRoute = routes.find(route => route.meta.name === path);
          if (matchingRoute) path = matchingRoute.shortPath;
        }

        params = Object.assign({}, route.params, context.params, params);
        for (const [key, value] of Object.entries(params)) {
          path = path.replace(`:${key}`, value);
        }
        return path
      }
    }


    const _meta = {
      props: {},
      templates: {},
      services: {
        plain: { propField: 'name', valueField: 'content' },
        twitter: { propField: 'name', valueField: 'content' },
        og: { propField: 'property', valueField: 'content' },
      },
      plugins: [
        {
          name: 'applyTemplate',
          condition: () => true,
          action: (prop, value) => {
            const template = _meta.getLongest(_meta.templates, prop) || (x => x);
            return [prop, template(value)]
          }
        },
        {
          name: 'createMeta',
          condition: () => true,
          action(prop, value) {
            _meta.writeMeta(prop, value);
          }
        },
        {
          name: 'createOG',
          condition: prop => !prop.match(':'),
          action(prop, value) {
            _meta.writeMeta(`og:${prop}`, value);
          }
        },
        {
          name: 'createTitle',
          condition: prop => prop === 'title',
          action(prop, value) {
            document.title = value;
          }
        }
      ],
      getLongest(repo, name) {
        const providers = repo[name];
        if (providers) {
          const currentPath = get_store_value(route).path;
          const allPaths = Object.keys(repo[name]);
          const matchingPaths = allPaths.filter(path => currentPath.includes(path));

          const longestKey = matchingPaths.sort((a, b) => b.length - a.length)[0];

          return providers[longestKey]
        }
      },
      writeMeta(prop, value) {
        const head = document.getElementsByTagName('head')[0];
        const match = prop.match(/(.+)\:/);
        const serviceName = match && match[1] || 'plain';
        const { propField, valueField } = meta.services[serviceName] || meta.services.plain;
        const oldElement = document.querySelector(`meta[${propField}='${prop}']`);
        if (oldElement) oldElement.remove();

        const newElement = document.createElement('meta');
        newElement.setAttribute(propField, prop);
        newElement.setAttribute(valueField, value);
        newElement.setAttribute('data-origin', 'routify');
        head.appendChild(newElement);
      },
      set(prop, value) {
        _meta.plugins.forEach(plugin => {
          if (plugin.condition(prop, value))
            [prop, value] = plugin.action(prop, value) || [prop, value];
        });
      },
      clear() {
        const oldElement = document.querySelector(`meta`);
        if (oldElement) oldElement.remove();
      },
      template(name, fn) {
        const origin = _meta.getOrigin();
        _meta.templates[name] = _meta.templates[name] || {};
        _meta.templates[name][origin] = fn;
      },
      update() {
        Object.keys(_meta.props).forEach((prop) => {
          let value = (_meta.getLongest(_meta.props, prop));
          _meta.plugins.forEach(plugin => {
            if (plugin.condition(prop, value)) {
              [prop, value] = plugin.action(prop, value) || [prop, value];

            }
          });
        });
      },
      batchedUpdate() {
        if (!_meta._pendingUpdate) {
          _meta._pendingUpdate = true;
          setTimeout(() => {
            _meta._pendingUpdate = false;
            this.update();
          });
        }
      },
      _updateQueued: false,
      getOrigin() {
        const routifyCtx = getContext('routify');
        return routifyCtx && get_store_value(routifyCtx).path || '/'
      },
      _pendingUpdate: false
    };

    const meta = new Proxy(_meta, {
      set(target, name, value, receiver) {
        const { props, getOrigin } = target;

        if (Reflect.has(target, name))
          Reflect.set(target, name, value, receiver);
        else {
          props[name] = props[name] || {};
          props[name][getOrigin()] = value;
        }
        
        if (window.routify.appLoaded)
          target.batchedUpdate();
        return true
      }
    });

    var config = {
      "pages": "C:/Users/AaronPC/Desktop/Yh Projekt/Egna projekt/potayder-o-panntoffler/src/pages",
      "sourceDir": "public",
      "routifyDir": "node_modules/@sveltech/routify/tmp",
      "ignore": [],
      "unknownPropWarnings": true,
      "dynamicImports": false,
      "singleBuild": false,
      "scroll": "smooth",
      "extensions": [
        "html",
        "svelte",
        "md"
      ],
      "distDir": "dist",
      "noPrerender": false,
      "unusedPropWarnings": true
    };

    const MATCH_PARAM = RegExp(/\:[^\/\()]+/g);

    function handleScroll(element) {
      scrollAncestorsToTop(element);
      handleHash();
    }

    function handleHash() {
      const { scroll } = config;
      const options = ['auto', 'smooth'];
      const { hash } = window.location;
      if (scroll && hash) {
        const behavior = (options.includes(scroll) && scroll) || 'auto';
        const el = document.querySelector(hash);
        if (hash && el) el.scrollIntoView({ behavior });
      }
    }

    function scrollAncestorsToTop(element) {
      if (
        element &&
        element.scrollTo &&
        element.dataset.routify !== 'scroll-lock'
      ) {
        element.scrollTo(0, 0);
        scrollAncestorsToTop(element.parentElement);
      }
    }

    const pathToRegex = (str, recursive) => {
      const suffix = recursive ? '' : '/?$'; //fallbacks should match recursively
      str = str.replace(/\/_fallback?$/, '(/|$)');
      str = str.replace(/\/index$/, '(/index)?'); //index files should be matched even if not present in url
      str = '^' + str.replace(MATCH_PARAM, '([^/]+)') + suffix;
      return str
    };

    const pathToParams = string => {
      const matches = string.match(MATCH_PARAM);
      if (matches) return matches.map(str => str.substr(1, str.length - 2))
    };

    const pathToRank = ({ path }) => {
      return path
        .split('/')
        .filter(Boolean)
        .map(str => (str === '_fallback' ? 'A' : str.startsWith(':') ? 'B' : 'C'))
        .join('')
    };

    let warningSuppressed = false;

    /* eslint no-console: 0 */
    function suppressWarnings() {
      if (warningSuppressed) return
      const consoleWarn = console.warn;
      console.warn = function(msg, ...msgs) {
        const ignores = [
          "was created with unknown prop 'scoped'",
          "was created with unknown prop 'scopedSync'",
        ];
        if (!ignores.find(iMsg => msg.includes(iMsg)))
          return consoleWarn(msg, ...msgs)
      };
      warningSuppressed = true;
    }

    /* node_modules\@sveltech\routify\runtime\Route.svelte generated by Svelte v3.21.0 */
    const file = "node_modules\\@sveltech\\routify\\runtime\\Route.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    // (87:0) {#if component}
    function create_if_block_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*remainingLayouts*/ ctx[8].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(87:0) {#if component}",
    		ctx
    	});

    	return block;
    }

    // (104:2) {:else}
    function create_else_block(ctx) {
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[5] },
    		/*propFromParam*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[7];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, propFromParam*/ 41)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 32 && { scopedSync: /*scopedSync*/ ctx[5] },
    					dirty & /*propFromParam*/ 8 && get_spread_object(/*propFromParam*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[7])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(104:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (88:2) {#if remainingLayouts.length}
    function create_if_block_2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = [0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*key*/ ctx[4];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*component, scoped, scopedSync, propFromParam, remainingLayouts, decorator, Decorator, isDecorator, scopeToChild*/ 134219243) {
    				const each_value = [0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(88:2) {#if remainingLayouts.length}",
    		ctx
    	});

    	return block;
    }

    // (90:6) <svelte:component          this={component}          let:scoped={scopeToChild}          let:decorator          {scoped}          {scopedSync}          {...propFromParam}>
    function create_default_slot(ctx) {
    	let t;
    	let current;

    	const route_1 = new Route({
    			props: {
    				layouts: [.../*remainingLayouts*/ ctx[8]],
    				Decorator: typeof /*decorator*/ ctx[27] !== "undefined"
    				? /*decorator*/ ctx[27]
    				: /*Decorator*/ ctx[1],
    				childOfDecorator: /*isDecorator*/ ctx[6],
    				scoped: {
    					.../*scoped*/ ctx[0],
    					.../*scopeToChild*/ ctx[10]
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*remainingLayouts*/ 256) route_1_changes.layouts = [.../*remainingLayouts*/ ctx[8]];

    			if (dirty & /*decorator, Decorator*/ 134217730) route_1_changes.Decorator = typeof /*decorator*/ ctx[27] !== "undefined"
    			? /*decorator*/ ctx[27]
    			: /*Decorator*/ ctx[1];

    			if (dirty & /*isDecorator*/ 64) route_1_changes.childOfDecorator = /*isDecorator*/ ctx[6];

    			if (dirty & /*scoped, scopeToChild*/ 1025) route_1_changes.scoped = {
    				.../*scoped*/ ctx[0],
    				.../*scopeToChild*/ ctx[10]
    			};

    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(90:6) <svelte:component          this={component}          let:scoped={scopeToChild}          let:decorator          {scoped}          {scopedSync}          {...propFromParam}>",
    		ctx
    	});

    	return block;
    }

    // (89:4) {#each [0] as dummy (key)}
    function create_each_block(key_2, ctx) {
    	let first;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[5] },
    		/*propFromParam*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[7];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: {
    				default: [
    					create_default_slot,
    					({ scoped: scopeToChild, decorator }) => ({ 10: scopeToChild, 27: decorator }),
    					({ scoped: scopeToChild, decorator }) => (scopeToChild ? 1024 : 0) | (decorator ? 134217728 : 0)
    				]
    			},
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		key: key_2,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, propFromParam*/ 41)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 32 && { scopedSync: /*scopedSync*/ ctx[5] },
    					dirty & /*propFromParam*/ 8 && get_spread_object(/*propFromParam*/ ctx[3])
    				])
    			: {};

    			if (dirty & /*$$scope, remainingLayouts, decorator, Decorator, isDecorator, scoped, scopeToChild*/ 402654531) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[7])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(89:4) {#each [0] as dummy (key)}",
    		ctx
    	});

    	return block;
    }

    // (116:0) {#if !parentElement}
    function create_if_block(ctx) {
    	let span;
    	let setParent_action;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			add_location(span, file, 116, 2, 3089);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, span, anchor);
    			if (remount) dispose();
    			dispose = action_destroyer(setParent_action = /*setParent*/ ctx[9].call(null, span));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(116:0) {#if !parentElement}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*component*/ ctx[7] && create_if_block_1(ctx);
    	let if_block1 = !/*parentElement*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*component*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*component*/ 128) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*parentElement*/ ctx[2]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function onAppLoaded() {
    	// Let every know the last child has rendered
    	if (!window.routify.stopAutoReady) {
    		dispatchEvent(new CustomEvent("app-loaded"));
    		window.routify.appLoaded = true;
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let $route;
    	let $routes;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(17, $route = $$value));
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, $$value => $$invalidate(18, $routes = $$value));

    	let { layouts = [] } = $$props,
    		{ scoped = {} } = $$props,
    		{ Decorator = undefined } = $$props,
    		{ childOfDecorator = false } = $$props;

    	let scopeToChild,
    		props = {},
    		parentElement,
    		propFromParam = {},
    		key = 0,
    		scopedSync = {},
    		isDecorator = false;

    	const context = writable({});
    	setContext("routify", context);

    	function setParent(el) {
    		$$invalidate(2, parentElement = el.parentElement);
    	}

    	let _lastLayout, _Component;

    	function onComponentLoaded() {
    		$$invalidate(13, _lastLayout = layout);
    		if (layoutIsUpdated) $$invalidate(4, key++, key);
    		if (remainingLayouts.length === 0) onLastComponentLoaded();
    		const url = _url(layout, $route, $routes);

    		context.set({
    			route: $route,
    			path: layout.path,
    			url,
    			goto: _goto(url),
    			isActive: _isActive(url, $route)
    		});
    	}

    	let component;

    	function setComponent(layout) {
    		if (layoutIsUpdated) _Component = layout.component();

    		if (_Component.then) _Component.then(res => {
    			$$invalidate(7, component = res);
    			$$invalidate(5, scopedSync = { ...scoped });
    			onComponentLoaded();
    		}); else {
    			$$invalidate(7, component = _Component);
    			$$invalidate(5, scopedSync = { ...scoped });
    			onComponentLoaded();
    		}
    	}

    	async function onLastComponentLoaded() {
    		await tick();
    		handleScroll(parentElement);
    		meta.update();
    		if (!window.routify.appLoaded) onAppLoaded();
    	}

    	const writable_props = ["layouts", "scoped", "Decorator", "childOfDecorator"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, []);

    	$$self.$set = $$props => {
    		if ("layouts" in $$props) $$invalidate(11, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("childOfDecorator" in $$props) $$invalidate(12, childOfDecorator = $$props.childOfDecorator);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onDestroy,
    		onMount,
    		tick,
    		writable,
    		_url,
    		_goto,
    		_isActive,
    		meta,
    		route,
    		routes,
    		handleScroll,
    		layouts,
    		scoped,
    		Decorator,
    		childOfDecorator,
    		scopeToChild,
    		props,
    		parentElement,
    		propFromParam,
    		key,
    		scopedSync,
    		isDecorator,
    		context,
    		setParent,
    		_lastLayout,
    		_Component,
    		onComponentLoaded,
    		component,
    		setComponent,
    		onLastComponentLoaded,
    		onAppLoaded,
    		layout,
    		remainingLayouts,
    		layoutIsUpdated,
    		$route,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("layouts" in $$props) $$invalidate(11, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("childOfDecorator" in $$props) $$invalidate(12, childOfDecorator = $$props.childOfDecorator);
    		if ("scopeToChild" in $$props) $$invalidate(10, scopeToChild = $$props.scopeToChild);
    		if ("props" in $$props) props = $$props.props;
    		if ("parentElement" in $$props) $$invalidate(2, parentElement = $$props.parentElement);
    		if ("propFromParam" in $$props) $$invalidate(3, propFromParam = $$props.propFromParam);
    		if ("key" in $$props) $$invalidate(4, key = $$props.key);
    		if ("scopedSync" in $$props) $$invalidate(5, scopedSync = $$props.scopedSync);
    		if ("isDecorator" in $$props) $$invalidate(6, isDecorator = $$props.isDecorator);
    		if ("_lastLayout" in $$props) $$invalidate(13, _lastLayout = $$props._lastLayout);
    		if ("_Component" in $$props) _Component = $$props._Component;
    		if ("component" in $$props) $$invalidate(7, component = $$props.component);
    		if ("layout" in $$props) $$invalidate(15, layout = $$props.layout);
    		if ("remainingLayouts" in $$props) $$invalidate(8, remainingLayouts = $$props.remainingLayouts);
    		if ("layoutIsUpdated" in $$props) layoutIsUpdated = $$props.layoutIsUpdated;
    	};

    	let layout;
    	let remainingLayouts;
    	let layoutIsUpdated;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*Decorator, childOfDecorator, layouts*/ 6146) {
    			 if (Decorator && !childOfDecorator) {
    				$$invalidate(6, isDecorator = true);

    				$$invalidate(11, layouts = [
    					{
    						component: () => Decorator,
    						path: layouts[0].path + "__decorator"
    					},
    					...layouts
    				]);
    			}
    		}

    		if ($$self.$$.dirty & /*layouts*/ 2048) {
    			 $$invalidate(15, [layout, ...remainingLayouts] = layouts, layout, ((($$invalidate(8, remainingLayouts), $$invalidate(11, layouts)), $$invalidate(1, Decorator)), $$invalidate(12, childOfDecorator)));
    		}

    		if ($$self.$$.dirty & /*layout*/ 32768) {
    			 if (layout && layout.param) $$invalidate(3, propFromParam = layout.param);
    		}

    		if ($$self.$$.dirty & /*_lastLayout, layout*/ 40960) {
    			 layoutIsUpdated = !_lastLayout || _lastLayout.path !== layout.path;
    		}

    		if ($$self.$$.dirty & /*layout*/ 32768) {
    			 setComponent(layout);
    		}
    	};

    	return [
    		scoped,
    		Decorator,
    		parentElement,
    		propFromParam,
    		key,
    		scopedSync,
    		isDecorator,
    		component,
    		remainingLayouts,
    		setParent,
    		scopeToChild,
    		layouts,
    		childOfDecorator
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			layouts: 11,
    			scoped: 0,
    			Decorator: 1,
    			childOfDecorator: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get layouts() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layouts(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scoped() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scoped(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Decorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Decorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get childOfDecorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set childOfDecorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const { _hooks } = beforeUrlChange;

    function init$1(routes, callback) {
      let prevRoute = false;

      function updatePage(url, shallow) {
        const currentUrl = window.location.pathname;
        url = url || currentUrl;

        const route$1 = urlToRoute(url, routes);
        const currentRoute = shallow && urlToRoute(currentUrl, routes);
        const contextRoute = currentRoute || route$1;
        const layouts = [...contextRoute.layouts, route$1];
        delete prevRoute.prev;
        route$1.prev = prevRoute;
        prevRoute = route$1;

        //set the route in the store
        route.set(route$1);

        //run callback in Router.svelte
        callback(layouts);
      }

      const destroy = createEventListeners(updatePage);

      return { updatePage, destroy }
    }

    /**
     * svelte:window events doesn't work on refresh
     * @param {Function} updatePage
     */
    function createEventListeners(updatePage) {
    ['pushState', 'replaceState'].forEach(eventName => {
        const fn = history[eventName];
        history[eventName] = async function (state, title, url) {
          const event = new Event(eventName.toLowerCase());
          Object.assign(event, { state, title, url });

          if (await runHooksBeforeUrlChange(event)) {
            fn.apply(this, [state, title, url]);
            return dispatchEvent(event)
          }
        };
      });

      let _ignoreNextPop = false;

      const listeners = {
        click: handleClick,
        pushstate: () => updatePage(),
        replacestate: () => updatePage(),
        popstate: async event => {
          if (_ignoreNextPop)
            _ignoreNextPop = false;
          else {
            if (await runHooksBeforeUrlChange(event)) {
              updatePage();
            } else {
              _ignoreNextPop = true;
              event.preventDefault();
              history.go(1);
            }
          }
        },
      };

      Object.entries(listeners).forEach(args => addEventListener(...args));

      const unregister = () => {
        Object.entries(listeners).forEach(args => removeEventListener(...args));
      };

      return unregister
    }

    function handleClick(event) {
      const el = event.target.closest('a');
      const href = el && el.getAttribute('href');

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button ||
        event.defaultPrevented
      )
        return
      if (!href || el.target || el.host !== location.host) return

      event.preventDefault();
      history.pushState({}, '', href);
    }

    async function runHooksBeforeUrlChange(event) {
      const route$1 = get_store_value(route);
      for (const hook of _hooks.filter(Boolean)) {
        // return false if the hook returns false
        if (await !hook(event, route$1)) return false
      }
      return true
    }

    function urlToRoute(url, routes) {
      const mockUrl = new URL(location).searchParams.get('__mock-url');
      url = mockUrl || url;

      const route = routes.find(route => url.match(route.regex));
      if (!route)
        throw new Error(
          `Route could not be found. Make sure ${url}.svelte or ${url}/index.svelte exists. A restart may be required.`
        )

      if (route.paramKeys) {
        const layouts = layoutByPos(route.layouts);
        const fragments = url.split('/').filter(Boolean);
        const routeProps = getRouteProps(route.path);

        routeProps.forEach((prop, i) => {
          if (prop) {
            route.params[prop] = fragments[i];
            if (layouts[i]) layouts[i].param = { [prop]: fragments[i] };
            else route.param = { [prop]: fragments[i] };
          }
        });
      }

      route.leftover = url.replace(new RegExp(route.regex), '');

      return route
    }

    function layoutByPos(layouts) {
      const arr = [];
      layouts.forEach(layout => {
        arr[layout.path.split('/').filter(Boolean).length - 1] = layout;
      });
      return arr
    }

    function getRouteProps(url) {
      return url
        .split('/')
        .filter(Boolean)
        .map(f => f.match(/\:(.+)/))
        .map(f => f && f[1])
    }

    /* node_modules\@sveltech\routify\runtime\Router.svelte generated by Svelte v3.21.0 */

    // (43:0) {#if layouts}
    function create_if_block$1(ctx) {
    	let current;

    	const route = new Route({
    			props: { layouts: /*layouts*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_changes = {};
    			if (dirty & /*layouts*/ 1) route_changes.layouts = /*layouts*/ ctx[0];
    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(43:0) {#if layouts}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*layouts*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*layouts*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*layouts*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { routes: routes$1 } = $$props;
    	let layouts;
    	let navigator;
    	suppressWarnings();

    	if (!window.routify) {
    		window.routify = {};
    	}

    	const updatePage = (...args) => navigator && navigator.updatePage(...args);
    	setContext("routifyupdatepage", updatePage);
    	const callback = res => $$invalidate(0, layouts = res);

    	const cleanup = () => {
    		if (!navigator) return;
    		navigator.destroy();
    		navigator = null;
    	};

    	const doInit = () => {
    		cleanup();
    		navigator = init$1(routes$1, callback);
    		routes.set(routes$1);
    		navigator.updatePage();
    	};

    	onDestroy(cleanup);
    	const writable_props = ["routes"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, []);

    	$$self.$set = $$props => {
    		if ("routes" in $$props) $$invalidate(1, routes$1 = $$props.routes);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		onDestroy,
    		Route,
    		init: init$1,
    		routesStore: routes,
    		suppressWarnings,
    		routes: routes$1,
    		layouts,
    		navigator,
    		updatePage,
    		callback,
    		cleanup,
    		doInit
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(1, routes$1 = $$props.routes);
    		if ("layouts" in $$props) $$invalidate(0, layouts = $$props.layouts);
    		if ("navigator" in $$props) navigator = $$props.navigator;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*routes*/ 2) {
    			 if (routes$1) doInit();
    		}
    	};

    	return [layouts, routes$1];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { routes: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*routes*/ ctx[1] === undefined && !("routes" in props)) {
    			console.warn("<Router> was created without expected prop 'routes'");
    		}
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function buildRoutes(routes, routeKeys) {
      return (
        routes
          // .map(sr => deserializeRoute(sr, routeKeys))
          .map(decorateRoute)
          .sort((c, p) => (c.ranking >= p.ranking ? -1 : 1))
      )
    }

    const decorateRoute = function(route) {
      route.paramKeys = pathToParams(route.path);
      route.regex = pathToRegex(route.path, route.isFallback);
      route.name = route.path.match(/[^\/]*\/[^\/]+$/)[0].replace(/[^\w\/]/g, ''); //last dir and name, then replace all but \w and /
      route.ranking = pathToRank(route);
      route.layouts.map(l => {
        l.param = {};
        return l
      });
      route.params = {};

      return route
    };

    /* src\components\cardinfo.svelte generated by Svelte v3.21.0 */

    const file$1 = "src\\components\\cardinfo.svelte";

    function create_fragment$2(ctx) {
    	let h2;
    	let t0;
    	let t1;
    	let p;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			p = element("p");
    			t2 = text(/*agetitle*/ ctx[1]);
    			t3 = space();
    			t4 = text(/*gender*/ ctx[2]);
    			t5 = text(" i ");
    			t6 = text(/*city*/ ctx[3]);
    			attr_dev(h2, "class", "svelte-abv1bz");
    			add_location(h2, file$1, 15, 1, 140);
    			attr_dev(p, "class", "svelte-abv1bz");
    			add_location(p, file$1, 16, 1, 159);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, t6);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			if (dirty & /*agetitle*/ 2) set_data_dev(t2, /*agetitle*/ ctx[1]);
    			if (dirty & /*gender*/ 4) set_data_dev(t4, /*gender*/ ctx[2]);
    			if (dirty & /*city*/ 8) set_data_dev(t6, /*city*/ ctx[3]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { title } = $$props;
    	let { agetitle = "Ung" } = $$props;
    	let { gender = "kvinna" } = $$props;
    	let { city } = $$props;
    	const writable_props = ["title", "agetitle", "gender", "city"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cardinfo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Cardinfo", $$slots, []);

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("agetitle" in $$props) $$invalidate(1, agetitle = $$props.agetitle);
    		if ("gender" in $$props) $$invalidate(2, gender = $$props.gender);
    		if ("city" in $$props) $$invalidate(3, city = $$props.city);
    	};

    	$$self.$capture_state = () => ({ title, agetitle, gender, city });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("agetitle" in $$props) $$invalidate(1, agetitle = $$props.agetitle);
    		if ("gender" in $$props) $$invalidate(2, gender = $$props.gender);
    		if ("city" in $$props) $$invalidate(3, city = $$props.city);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, agetitle, gender, city];
    }

    class Cardinfo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			title: 0,
    			agetitle: 1,
    			gender: 2,
    			city: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cardinfo",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<Cardinfo> was created without expected prop 'title'");
    		}

    		if (/*city*/ ctx[3] === undefined && !("city" in props)) {
    			console.warn("<Cardinfo> was created without expected prop 'city'");
    		}
    	}

    	get title() {
    		throw new Error("<Cardinfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Cardinfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get agetitle() {
    		throw new Error("<Cardinfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set agetitle(value) {
    		throw new Error("<Cardinfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gender() {
    		throw new Error("<Cardinfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gender(value) {
    		throw new Error("<Cardinfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get city() {
    		throw new Error("<Cardinfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set city(value) {
    		throw new Error("<Cardinfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\audioplayer.svelte generated by Svelte v3.21.0 */
    const file$2 = "src\\components\\audioplayer.svelte";

    function create_fragment$3(ctx) {
    	let article;
    	let t;
    	let audio_1;
    	let audio_1_src_value;
    	let audio_1_is_paused = true;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			article = element("article");
    			if (default_slot) default_slot.c();
    			t = space();
    			audio_1 = element("audio");
    			audio_1.controls = true;
    			attr_dev(audio_1, "id", /*id*/ ctx[1]);
    			if (audio_1.src !== (audio_1_src_value = /*src*/ ctx[0])) attr_dev(audio_1, "src", audio_1_src_value);
    			attr_dev(audio_1, "class", "svelte-x1igb1");
    			add_location(audio_1, file$2, 54, 2, 899);
    			attr_dev(article, "class", "svelte-x1igb1");
    			toggle_class(article, "playing", !/*paused*/ ctx[3]);
    			add_location(article, file$2, 51, 0, 848);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, article, anchor);

    			if (default_slot) {
    				default_slot.m(article, null);
    			}

    			append_dev(article, t);
    			append_dev(article, audio_1);
    			/*audio_1_binding*/ ctx[7](audio_1);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(audio_1, "play", /*audio_1_play_pause_handler*/ ctx[8]),
    				listen_dev(audio_1, "pause", /*audio_1_play_pause_handler*/ ctx[8]),
    				listen_dev(audio_1, "play", /*stopOthers*/ ctx[4], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[5], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null));
    				}
    			}

    			if (!current || dirty & /*id*/ 2) {
    				attr_dev(audio_1, "id", /*id*/ ctx[1]);
    			}

    			if (!current || dirty & /*src*/ 1 && audio_1.src !== (audio_1_src_value = /*src*/ ctx[0])) {
    				attr_dev(audio_1, "src", audio_1_src_value);
    			}

    			if (dirty & /*paused*/ 8 && audio_1_is_paused !== (audio_1_is_paused = /*paused*/ ctx[3])) {
    				audio_1[audio_1_is_paused ? "pause" : "play"]();
    			}

    			if (dirty & /*paused*/ 8) {
    				toggle_class(article, "playing", !/*paused*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (default_slot) default_slot.d(detaching);
    			/*audio_1_binding*/ ctx[7](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const elements = new Set();

    function playMarker() {
    	elements.forEach(element => {
    		element.play();
    	});
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { src } = $$props;
    	let { id } = $$props;
    	let audio;
    	let paused = true;

    	onMount(() => {
    		elements.add(audio);
    		return () => elements.delete(audio);
    	});

    	function stopOthers() {
    		elements.forEach(element => {
    			if (element !== audio) element.pause();
    		});
    	}

    	const writable_props = ["src", "id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Audioplayer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Audioplayer", $$slots, ['default']);

    	function audio_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, audio = $$value);
    		});
    	}

    	function audio_1_play_pause_handler() {
    		paused = this.paused;
    		$$invalidate(3, paused);
    	}

    	$$self.$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		elements,
    		playMarker,
    		onMount,
    		Cardinfo,
    		src,
    		id,
    		audio,
    		paused,
    		stopOthers
    	});

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("audio" in $$props) $$invalidate(2, audio = $$props.audio);
    		if ("paused" in $$props) $$invalidate(3, paused = $$props.paused);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		src,
    		id,
    		audio,
    		paused,
    		stopOthers,
    		$$scope,
    		$$slots,
    		audio_1_binding,
    		audio_1_play_pause_handler
    	];
    }

    class Audioplayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { src: 0, id: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Audioplayer",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*src*/ ctx[0] === undefined && !("src" in props)) {
    			console.warn("<Audioplayer> was created without expected prop 'src'");
    		}

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console.warn("<Audioplayer> was created without expected prop 'id'");
    		}
    	}

    	get src() {
    		throw new Error("<Audioplayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Audioplayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Audioplayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Audioplayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\modal.svelte generated by Svelte v3.21.0 */

    const file$3 = "src\\components\\modal.svelte";

    function create_fragment$4(ctx) {
    	let div4;
    	let div3;
    	let button0;
    	let t0;
    	let div0;
    	let h2;
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let div2;
    	let button1;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			button0 = element("button");
    			t0 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			t1 = text(/*modaltitle*/ ctx[0]);
    			t2 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			t3 = space();
    			div2 = element("div");
    			button1 = element("button");
    			button1.textContent = "Stäng";
    			attr_dev(button0, "class", "uk-modal-close-default");
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "uk-close", "");
    			add_location(button0, file$3, 8, 4, 136);
    			attr_dev(h2, "class", "uk-modal-title");
    			add_location(h2, file$3, 10, 6, 250);
    			attr_dev(div0, "class", "uk-modal-header");
    			add_location(div0, file$3, 9, 4, 213);
    			attr_dev(div1, "class", "uk-modal-body");
    			add_location(div1, file$3, 12, 4, 312);
    			attr_dev(button1, "class", "uk-button uk-button-default uk-modal-close");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$3, 16, 6, 433);
    			attr_dev(div2, "class", "uk-modal-footer uk-text-right");
    			add_location(div2, file$3, 15, 4, 382);
    			attr_dev(div3, "class", "uk-modal-dialog");
    			add_location(div3, file$3, 7, 2, 101);
    			attr_dev(div4, "id", /*modalid*/ ctx[1]);
    			attr_dev(div4, "uk-modal", "");
    			add_location(div4, file$3, 6, 0, 70);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, button0);
    			append_dev(div3, t0);
    			append_dev(div3, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, button1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*modaltitle*/ 1) set_data_dev(t1, /*modaltitle*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
    				}
    			}

    			if (!current || dirty & /*modalid*/ 2) {
    				attr_dev(div4, "id", /*modalid*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { modaltitle } = $$props;
    	let { modalid } = $$props;
    	const writable_props = ["modaltitle", "modalid"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Modal", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("modaltitle" in $$props) $$invalidate(0, modaltitle = $$props.modaltitle);
    		if ("modalid" in $$props) $$invalidate(1, modalid = $$props.modalid);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ modaltitle, modalid });

    	$$self.$inject_state = $$props => {
    		if ("modaltitle" in $$props) $$invalidate(0, modaltitle = $$props.modaltitle);
    		if ("modalid" in $$props) $$invalidate(1, modalid = $$props.modalid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [modaltitle, modalid, $$scope, $$slots];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { modaltitle: 0, modalid: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*modaltitle*/ ctx[0] === undefined && !("modaltitle" in props)) {
    			console.warn("<Modal> was created without expected prop 'modaltitle'");
    		}

    		if (/*modalid*/ ctx[1] === undefined && !("modalid" in props)) {
    			console.warn("<Modal> was created without expected prop 'modalid'");
    		}
    	}

    	get modaltitle() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modaltitle(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalid() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalid(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\markers\citiesin\blekinge\Hallevik.svelte generated by Svelte v3.21.0 */
    const file$4 = "src\\pages\\markers\\citiesin\\blekinge\\Hallevik.svelte";

    function create_fragment$5(ctx) {
    	let div0;
    	let a0;
    	let img0;
    	let t0;
    	let a1;
    	let img1;
    	let t1;
    	let div1;
    	let a2;
    	let img2;
    	let t2;
    	let a3;
    	let img3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			attr_dev(img0, "id", "youngwo-hallevik");
    			attr_dev(img0, "alt", "hallevik");
    			attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img0, "class", "hallevik-marker svelte-3tws20");
    			attr_dev(img0, "data-src", "../images/marker-small.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$4, 30, 4, 670);
    			attr_dev(a0, "href", "#modal-youngwoman-hallevik");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$4, 29, 2, 617);
    			attr_dev(img1, "id", "youngm-hallevik");
    			attr_dev(img1, "alt", "hallevik");
    			attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img1, "class", "hallevik-marker svelte-3tws20");
    			attr_dev(img1, "data-src", "../images/marker-small.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$4, 40, 4, 912);
    			attr_dev(a1, "href", "#modal-youngman-hallevik");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$4, 39, 2, 861);
    			attr_dev(div0, "id", "young-hallevik");
    			add_location(div0, file$4, 28, 0, 588);
    			attr_dev(img2, "id", "oldwo-hallevik");
    			attr_dev(img2, "alt", "hallevik");
    			attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img2, "class", "hallevik-marker svelte-3tws20");
    			attr_dev(img2, "data-src", "../images/marker-small.png");
    			attr_dev(img2, "uk-img", "");
    			add_location(img2, file$4, 52, 4, 1186);
    			attr_dev(a2, "href", "#modal-oldwoman-hallevik");
    			attr_dev(a2, "uk-toggle", "");
    			add_location(a2, file$4, 51, 2, 1135);
    			attr_dev(img3, "id", "oldm-hallevik");
    			attr_dev(img3, "alt", "hallevik");
    			attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img3, "class", "hallevik-marker svelte-3tws20");
    			attr_dev(img3, "data-src", "../images/marker-small.png");
    			attr_dev(img3, "uk-img", "");
    			add_location(img3, file$4, 62, 4, 1424);
    			attr_dev(a3, "href", "#modal-oldman-hallevik");
    			attr_dev(a3, "uk-toggle", "");
    			add_location(a3, file$4, 61, 2, 1375);
    			attr_dev(div1, "id", "old-hallevik");
    			add_location(div1, file$4, 50, 0, 1108);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { cityName } = $$props;
    	const writable_props = ["cityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hallevik> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Hallevik", $$slots, []);

    	$$self.$set = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	$$self.$capture_state = () => ({ cityName, Audioplayer, Cardinfo });

    	$$self.$inject_state = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName];
    }

    class Hallevik extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { cityName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hallevik",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !("cityName" in props)) {
    			console.warn("<Hallevik> was created without expected prop 'cityName'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Hallevik>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Hallevik>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\blekinge-cities\hallevik-city.svelte generated by Svelte v3.21.0 */

    // (9:2) <Audioplayer      id="hallevik-yw"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/youngwoman.mp3">
    function create_default_slot_7(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Hallevik",
    				agetitle: "Ung",
    				gender: "kvinna",
    				city: "Hallevik"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(9:2) <Audioplayer      id=\\\"hallevik-yw\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/youngwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Modal modalid="modal-youngwoman-hallevik" modaltitle="Skåne">
    function create_default_slot_6(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "hallevik-yw",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/youngwoman.mp3",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(8:0) <Modal modalid=\\\"modal-youngwoman-hallevik\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Audioplayer      id="hallevik-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/oldwoman.mp3">
    function create_default_slot_5(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Hallevik",
    				agetitle: "Äldre",
    				gender: "kvinna",
    				city: "Hallevik"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(17:2) <Audioplayer      id=\\\"hallevik-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/oldwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Modal modalid="modal-oldwoman-hallevik" modaltitle="Skåne">
    function create_default_slot_4(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "hallevik-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/oldwoman.mp3",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(16:0) <Modal modalid=\\\"modal-oldwoman-hallevik\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (29:2) <Audioplayer      id="hallevik-ow"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/youngman.mp3">
    function create_default_slot_3(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Hallevik",
    				agetitle: "Ung",
    				gender: "man",
    				city: "Hallevik"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(29:2) <Audioplayer      id=\\\"hallevik-ow\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/youngman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (28:0) <Modal modalid="modal-youngman-hallevik" modaltitle="Skåne">
    function create_default_slot_2(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "hallevik-ow",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/youngman.mp3",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(28:0) <Modal modalid=\\\"modal-youngman-hallevik\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (37:2) <Audioplayer      id="hallevik-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/oldman.mp3">
    function create_default_slot_1(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Hallevik",
    				agetitle: "Äldre",
    				gender: "man",
    				city: "Hallevik"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(37:2) <Audioplayer      id=\\\"hallevik-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/oldman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (36:0) <Modal modalid="modal-oldman-hallevik" modaltitle="Skåne">
    function create_default_slot$1(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "hallevik-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/hallevik/oldman.mp3",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(36:0) <Modal modalid=\\\"modal-oldman-hallevik\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-youngwoman-hallevik",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-oldwoman-hallevik",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal2 = new Modal({
    			props: {
    				modalid: "modal-youngman-hallevik",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal3 = new Modal({
    			props: {
    				modalid: "modal-oldman-hallevik",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			create_component(modal2.$$.fragment);
    			t2 = space();
    			create_component(modal3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			modal2.$set(modal2_changes);
    			const modal3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal3_changes.$$scope = { dirty, ctx };
    			}

    			modal3.$set(modal3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			transition_in(modal3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			transition_out(modal3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hallevik_city> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Hallevik_city", $$slots, []);

    	$$self.$capture_state = () => ({
    		Audioplayer,
    		Cardinfo,
    		Modal,
    		HallevikMarker: Hallevik
    	});

    	return [];
    }

    class Hallevik_city extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hallevik_city",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\pages\markers\citiesin\blekinge\Jamshog.svelte generated by Svelte v3.21.0 */
    const file$5 = "src\\pages\\markers\\citiesin\\blekinge\\Jamshog.svelte";

    function create_fragment$7(ctx) {
    	let div0;
    	let a0;
    	let img0;
    	let t0;
    	let a1;
    	let img1;
    	let t1;
    	let div1;
    	let a2;
    	let img2;
    	let t2;
    	let a3;
    	let img3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			attr_dev(img0, "id", "youngwo-jamshog");
    			attr_dev(img0, "alt", "jamshog");
    			attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img0, "class", "jamshog-marker svelte-b3phgd");
    			attr_dev(img0, "data-src", "../images/marker-small.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$5, 30, 4, 660);
    			attr_dev(a0, "href", "#modal-youngwoman-jamshog");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$5, 29, 2, 608);
    			attr_dev(img1, "id", "youngm-jamshog");
    			attr_dev(img1, "alt", "jamshog");
    			attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img1, "class", "jamshog-marker svelte-b3phgd");
    			attr_dev(img1, "data-src", "../images/marker-small.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$5, 40, 4, 898);
    			attr_dev(a1, "href", "#modal-youngman-jamshog");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$5, 39, 2, 848);
    			attr_dev(div0, "id", "young-jamshog");
    			add_location(div0, file$5, 28, 0, 580);
    			attr_dev(img2, "id", "oldwo-jamshog");
    			attr_dev(img2, "alt", "jamshog");
    			attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img2, "class", "jamshog-marker svelte-b3phgd");
    			attr_dev(img2, "data-src", "../images/marker-small.png");
    			attr_dev(img2, "uk-img", "");
    			add_location(img2, file$5, 52, 4, 1167);
    			attr_dev(a2, "href", "#modal-oldwoman-jamshog");
    			attr_dev(a2, "uk-toggle", "");
    			add_location(a2, file$5, 51, 2, 1117);
    			attr_dev(img3, "id", "oldm-jamshog");
    			attr_dev(img3, "alt", "jamshog");
    			attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img3, "class", "jamshog-marker svelte-b3phgd");
    			attr_dev(img3, "data-src", "../images/marker-small.png");
    			attr_dev(img3, "uk-img", "");
    			add_location(img3, file$5, 62, 4, 1401);
    			attr_dev(a3, "href", "#modal-oldman-jamshog");
    			attr_dev(a3, "uk-toggle", "");
    			add_location(a3, file$5, 61, 2, 1353);
    			attr_dev(div1, "id", "old-jamshog");
    			add_location(div1, file$5, 50, 0, 1091);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { cityName } = $$props;
    	const writable_props = ["cityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Jamshog> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Jamshog", $$slots, []);

    	$$self.$set = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	$$self.$capture_state = () => ({ cityName, Audioplayer, Cardinfo });

    	$$self.$inject_state = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName];
    }

    class Jamshog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { cityName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Jamshog",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !("cityName" in props)) {
    			console.warn("<Jamshog> was created without expected prop 'cityName'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Jamshog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Jamshog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\blekinge-cities\jamshog-city.svelte generated by Svelte v3.21.0 */

    // (9:2) <Audioplayer      id="jamshog-yw"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/youngwoman.mp3">
    function create_default_slot_7$1(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Jämshög",
    				agetitle: "Ung",
    				gender: "kvinna",
    				city: "Jämshög"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$1.name,
    		type: "slot",
    		source: "(9:2) <Audioplayer      id=\\\"jamshog-yw\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/youngwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Modal modalid="modal-youngwoman-jamshog" modaltitle="Skåne">
    function create_default_slot_6$1(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "jamshog-yw",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/youngwoman.mp3",
    				$$slots: { default: [create_default_slot_7$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(8:0) <Modal modalid=\\\"modal-youngwoman-jamshog\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Audioplayer      id="jamshog-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/oldwoman.mp3">
    function create_default_slot_5$1(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Jämshög",
    				agetitle: "Äldre",
    				gender: "Kvinna",
    				city: "Jämshög"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(17:2) <Audioplayer      id=\\\"jamshog-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/oldwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Modal modalid="modal-oldwoman-jamshog" modaltitle="Skåne">
    function create_default_slot_4$1(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "jamshog-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/oldwoman.mp3",
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(16:0) <Modal modalid=\\\"modal-oldwoman-jamshog\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:2) <Audioplayer      id="jamshog-ow"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/youngman.mp3">
    function create_default_slot_3$1(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Jämshög",
    				agetitle: "Ung",
    				gender: "man",
    				city: "Jämshög"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(25:2) <Audioplayer      id=\\\"jamshog-ow\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/youngman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:0) <Modal modalid="modal-youngman-jamshog" modaltitle="Skåne">
    function create_default_slot_2$1(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "jamshog-ow",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/youngman.mp3",
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(24:0) <Modal modalid=\\\"modal-youngman-jamshog\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Audioplayer      id="jamshog-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/oldman.mp3">
    function create_default_slot_1$1(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Jämshög",
    				agetitle: "Äldre",
    				gender: "man",
    				city: "Jämshög"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(33:2) <Audioplayer      id=\\\"jamshog-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/oldman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Modal modalid="modal-oldman-jamshog" modaltitle="Skåne">
    function create_default_slot$2(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "jamshog-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/jamshog/oldman.mp3",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(32:0) <Modal modalid=\\\"modal-oldman-jamshog\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-youngwoman-jamshog",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-oldwoman-jamshog",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal2 = new Modal({
    			props: {
    				modalid: "modal-youngman-jamshog",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal3 = new Modal({
    			props: {
    				modalid: "modal-oldman-jamshog",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			create_component(modal2.$$.fragment);
    			t2 = space();
    			create_component(modal3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			modal2.$set(modal2_changes);
    			const modal3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal3_changes.$$scope = { dirty, ctx };
    			}

    			modal3.$set(modal3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			transition_in(modal3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			transition_out(modal3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Jamshog_city> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Jamshog_city", $$slots, []);

    	$$self.$capture_state = () => ({
    		Audioplayer,
    		Cardinfo,
    		Modal,
    		JamshogMarker: Jamshog
    	});

    	return [];
    }

    class Jamshog_city extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Jamshog_city",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\pages\markers\citiesin\blekinge\Torhamn.svelte generated by Svelte v3.21.0 */
    const file$6 = "src\\pages\\markers\\citiesin\\blekinge\\Torhamn.svelte";

    function create_fragment$9(ctx) {
    	let div0;
    	let a0;
    	let img0;
    	let t0;
    	let a1;
    	let img1;
    	let t1;
    	let div1;
    	let a2;
    	let img2;
    	let t2;
    	let a3;
    	let img3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			attr_dev(img0, "id", "youngwo-torhamn");
    			attr_dev(img0, "alt", "torhamn");
    			attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img0, "class", "torhamn-marker svelte-jni0in");
    			attr_dev(img0, "data-src", "../images/marker-small.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$6, 30, 4, 660);
    			attr_dev(a0, "href", "#modal-youngwoman-torhamn");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$6, 29, 2, 608);
    			attr_dev(img1, "id", "youngm-torhamn");
    			attr_dev(img1, "alt", "torhamn");
    			attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img1, "class", "torhamn-marker svelte-jni0in");
    			attr_dev(img1, "data-src", "../images/marker-small.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$6, 40, 4, 898);
    			attr_dev(a1, "href", "#modal-youngman-torhamn");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$6, 39, 2, 848);
    			attr_dev(div0, "id", "young-torhamn");
    			add_location(div0, file$6, 28, 0, 580);
    			attr_dev(img2, "id", "oldwo-torhamn");
    			attr_dev(img2, "alt", "torhamn");
    			attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img2, "class", "torhamn-marker svelte-jni0in");
    			attr_dev(img2, "data-src", "../images/marker-small.png");
    			attr_dev(img2, "uk-img", "");
    			add_location(img2, file$6, 52, 4, 1167);
    			attr_dev(a2, "href", "#modal-oldwoman-torhamn");
    			attr_dev(a2, "uk-toggle", "");
    			add_location(a2, file$6, 51, 2, 1117);
    			attr_dev(img3, "id", "oldm-torhamn");
    			attr_dev(img3, "alt", "torhamn");
    			attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img3, "class", "torhamn-marker svelte-jni0in");
    			attr_dev(img3, "data-src", "../images/marker-small.png");
    			attr_dev(img3, "uk-img", "");
    			add_location(img3, file$6, 62, 4, 1401);
    			attr_dev(a3, "href", "#modal-oldman-torhamn");
    			attr_dev(a3, "uk-toggle", "");
    			add_location(a3, file$6, 61, 2, 1353);
    			attr_dev(div1, "id", "old-torhamn");
    			add_location(div1, file$6, 50, 0, 1091);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { cityName } = $$props;
    	const writable_props = ["cityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Torhamn> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Torhamn", $$slots, []);

    	$$self.$set = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	$$self.$capture_state = () => ({ cityName, Audioplayer, Cardinfo });

    	$$self.$inject_state = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName];
    }

    class Torhamn extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { cityName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Torhamn",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !("cityName" in props)) {
    			console.warn("<Torhamn> was created without expected prop 'cityName'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Torhamn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Torhamn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\blekinge-cities\torhamn-city.svelte generated by Svelte v3.21.0 */

    // (9:2) <Audioplayer      id="torhamn-yw"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/torhamn/youngwoman.mp3">
    function create_default_slot_7$2(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Torhamn",
    				agetitle: "Ung",
    				gender: "kvinna",
    				city: "Torhamn"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$2.name,
    		type: "slot",
    		source: "(9:2) <Audioplayer      id=\\\"torhamn-yw\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/torhamn/youngwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Modal modalid="modal-youngwoman-torhamn" modaltitle="Skåne">
    function create_default_slot_6$2(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "torhamn-yw",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/torhamn/youngwoman.mp3",
    				$$slots: { default: [create_default_slot_7$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$2.name,
    		type: "slot",
    		source: "(8:0) <Modal modalid=\\\"modal-youngwoman-torhamn\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Audioplayer      id="torhamn-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/torhamn/oldwoman.mp3">
    function create_default_slot_5$2(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Torhamn",
    				agetitle: "Äldre",
    				gender: "kvinna",
    				city: "Torhamn"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$2.name,
    		type: "slot",
    		source: "(17:2) <Audioplayer      id=\\\"torhamn-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/torhamn/oldwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Modal modalid="modal-oldwoman-torhamn" modaltitle="Skåne">
    function create_default_slot_4$2(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "torhamn-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/torhamn/oldwoman.mp3",
    				$$slots: { default: [create_default_slot_5$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$2.name,
    		type: "slot",
    		source: "(16:0) <Modal modalid=\\\"modal-oldwoman-torhamn\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:2) <Audioplayer      id="torhamn-ow"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/torhamn/youngman.mp3">
    function create_default_slot_3$2(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Torhamn",
    				agetitle: "Ung",
    				gender: "man",
    				city: "Torhamn"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(25:2) <Audioplayer      id=\\\"torhamn-ow\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/torhamn/youngman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:0) <Modal modalid="modal-youngman-torhamn" modaltitle="Skåne">
    function create_default_slot_2$2(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "torhamn-ow",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/torhamn/youngman.mp3",
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(24:0) <Modal modalid=\\\"modal-youngman-torhamn\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Audioplayer      id="torhamn-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/torhamn/oldman.mp3">
    function create_default_slot_1$2(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Torhamn",
    				agetitle: "Äldre",
    				gender: "man",
    				city: "Torhamn"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(33:2) <Audioplayer      id=\\\"torhamn-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/torhamn/oldman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Modal modalid="modal-oldman-torhamn" modaltitle="Skåne">
    function create_default_slot$3(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "torhamn-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/blekinge/torhamn/oldman.mp3",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(32:0) <Modal modalid=\\\"modal-oldman-torhamn\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-youngwoman-torhamn",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_6$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-oldwoman-torhamn",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_4$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal2 = new Modal({
    			props: {
    				modalid: "modal-youngman-torhamn",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal3 = new Modal({
    			props: {
    				modalid: "modal-oldman-torhamn",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			create_component(modal2.$$.fragment);
    			t2 = space();
    			create_component(modal3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			modal2.$set(modal2_changes);
    			const modal3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal3_changes.$$scope = { dirty, ctx };
    			}

    			modal3.$set(modal3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			transition_in(modal3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			transition_out(modal3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Torhamn_city> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Torhamn_city", $$slots, []);

    	$$self.$capture_state = () => ({
    		Audioplayer,
    		Cardinfo,
    		Modal,
    		TorhamnMarker: Torhamn
    	});

    	return [];
    }

    class Torhamn_city extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Torhamn_city",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\changebutton.svelte generated by Svelte v3.21.0 */

    const file$7 = "src\\components\\changebutton.svelte";

    function create_fragment$b(ctx) {
    	let button;
    	let t0;
    	let t1;
    	let button_uk_toggle_value;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text("Ändra Åldersgrupp ");
    			t1 = text(/*targetCityName*/ ctx[1]);
    			attr_dev(button, "class", "uk-button-default blue-btn svelte-i7dy9s");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "uk-toggle", button_uk_toggle_value = "target: " + /*targetCityId*/ ctx[0]);
    			add_location(button, file$7, 13, 0, 201);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*targetCityName*/ 2) set_data_dev(t1, /*targetCityName*/ ctx[1]);

    			if (dirty & /*targetCityId*/ 1 && button_uk_toggle_value !== (button_uk_toggle_value = "target: " + /*targetCityId*/ ctx[0])) {
    				attr_dev(button, "uk-toggle", button_uk_toggle_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { targetCityId } = $$props;
    	let { targetCityName } = $$props;
    	const writable_props = ["targetCityId", "targetCityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Changebutton> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Changebutton", $$slots, []);

    	$$self.$set = $$props => {
    		if ("targetCityId" in $$props) $$invalidate(0, targetCityId = $$props.targetCityId);
    		if ("targetCityName" in $$props) $$invalidate(1, targetCityName = $$props.targetCityName);
    	};

    	$$self.$capture_state = () => ({ targetCityId, targetCityName });

    	$$self.$inject_state = $$props => {
    		if ("targetCityId" in $$props) $$invalidate(0, targetCityId = $$props.targetCityId);
    		if ("targetCityName" in $$props) $$invalidate(1, targetCityName = $$props.targetCityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [targetCityId, targetCityName];
    }

    class Changebutton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { targetCityId: 0, targetCityName: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Changebutton",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*targetCityId*/ ctx[0] === undefined && !("targetCityId" in props)) {
    			console.warn("<Changebutton> was created without expected prop 'targetCityId'");
    		}

    		if (/*targetCityName*/ ctx[1] === undefined && !("targetCityName" in props)) {
    			console.warn("<Changebutton> was created without expected prop 'targetCityName'");
    		}
    	}

    	get targetCityId() {
    		throw new Error("<Changebutton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set targetCityId(value) {
    		throw new Error("<Changebutton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get targetCityName() {
    		throw new Error("<Changebutton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set targetCityName(value) {
    		throw new Error("<Changebutton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\blekinge.svelte generated by Svelte v3.21.0 */
    const file$8 = "src\\pages\\blekinge.svelte";

    function create_fragment$c(ctx) {
    	let nav;
    	let div0;
    	let ul;
    	let li0;
    	let a0;
    	let t0;
    	let a0_href_value;
    	let t1;
    	let li1;
    	let a1;
    	let t2;
    	let a1_href_value;
    	let t3;
    	let li2;
    	let a2;
    	let t4;
    	let a2_href_value;
    	let t5;
    	let li3;
    	let a3;
    	let t6;
    	let a3_href_value;
    	let t7;
    	let li4;
    	let a4;
    	let t8;
    	let a4_href_value;
    	let t9;
    	let div11;
    	let div5;
    	let div3;
    	let div2;
    	let div1;
    	let h30;
    	let t11;
    	let div4;
    	let p0;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let div6;
    	let img0;
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let div10;
    	let div7;
    	let img1;
    	let img1_src_value;
    	let t21;
    	let canvas;
    	let t22;
    	let div9;
    	let div8;
    	let h31;
    	let t24;
    	let p1;
    	let t26;
    	let t27;
    	let t28;
    	let current;

    	const changebutton0 = new Changebutton({
    			props: {
    				targetCityName: "Hallevik",
    				targetCityId: "#old-hallevik"
    			},
    			$$inline: true
    		});

    	const changebutton1 = new Changebutton({
    			props: {
    				targetCityName: "Jämshög",
    				targetCityId: "#old-jamshog"
    			},
    			$$inline: true
    		});

    	const changebutton2 = new Changebutton({
    			props: {
    				targetCityName: "Torhamn",
    				targetCityId: "#old-torhamn"
    			},
    			$$inline: true
    		});

    	const hallevik = new Hallevik({ $$inline: true });
    	const jamshog = new Jamshog({ $$inline: true });
    	const torhamn = new Torhamn({ $$inline: true });
    	const hallevikcity = new Hallevik_city({ $$inline: true });
    	const jamshogcity = new Jamshog_city({ $$inline: true });
    	const torhamncity = new Torhamn_city({ $$inline: true });

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t0 = text("Startsida");
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			t2 = text("Skåne");
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			t4 = text("Blekinge");
    			t5 = space();
    			li3 = element("li");
    			a3 = element("a");
    			t6 = text("Kalmar");
    			t7 = space();
    			li4 = element("li");
    			a4 = element("a");
    			t8 = text("Stockholm");
    			t9 = space();
    			div11 = element("div");
    			div5 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Blekinge, Smålands Skåne";
    			t11 = space();
    			div4 = element("div");
    			p0 = element("p");
    			p0.textContent = "Karlshamn är rätt nice, havsvy o så.";
    			t13 = space();
    			create_component(changebutton0.$$.fragment);
    			t14 = space();
    			create_component(changebutton1.$$.fragment);
    			t15 = space();
    			create_component(changebutton2.$$.fragment);
    			t16 = space();
    			div6 = element("div");
    			img0 = element("img");
    			t17 = space();
    			create_component(hallevik.$$.fragment);
    			t18 = space();
    			create_component(jamshog.$$.fragment);
    			t19 = space();
    			create_component(torhamn.$$.fragment);
    			t20 = space();
    			div10 = element("div");
    			div7 = element("div");
    			img1 = element("img");
    			t21 = space();
    			canvas = element("canvas");
    			t22 = space();
    			div9 = element("div");
    			div8 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Blekinge";
    			t24 = space();
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do\r\n          eiusmod tempor incididunt.";
    			t26 = space();
    			create_component(hallevikcity.$$.fragment);
    			t27 = space();
    			create_component(jamshogcity.$$.fragment);
    			t28 = space();
    			create_component(torhamncity.$$.fragment);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[0]("/"));
    			attr_dev(a0, "class", "svelte-4dp07p");
    			add_location(a0, file$8, 68, 8, 1623);
    			attr_dev(li0, "class", "uk-parent svelte-4dp07p");
    			add_location(li0, file$8, 67, 6, 1591);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[0]("/skane"));
    			attr_dev(a1, "class", "svelte-4dp07p");
    			add_location(a1, file$8, 71, 8, 1709);
    			attr_dev(li1, "class", "uk-parent svelte-4dp07p");
    			add_location(li1, file$8, 70, 6, 1677);
    			attr_dev(a2, "href", a2_href_value = /*$url*/ ctx[0]("/blekinge"));
    			attr_dev(a2, "class", "svelte-4dp07p");
    			add_location(a2, file$8, 74, 8, 1796);
    			attr_dev(li2, "class", "uk-parent svelte-4dp07p");
    			add_location(li2, file$8, 73, 6, 1764);
    			attr_dev(a3, "href", a3_href_value = /*$url*/ ctx[0]("/kalmar"));
    			attr_dev(a3, "class", "svelte-4dp07p");
    			add_location(a3, file$8, 77, 8, 1889);
    			attr_dev(li3, "class", "uk-parent svelte-4dp07p");
    			add_location(li3, file$8, 76, 6, 1857);
    			attr_dev(a4, "href", a4_href_value = /*$url*/ ctx[0]("/stockholm"));
    			attr_dev(a4, "class", "svelte-4dp07p");
    			add_location(a4, file$8, 80, 8, 1978);
    			attr_dev(li4, "class", "uk-parent svelte-4dp07p");
    			add_location(li4, file$8, 79, 6, 1946);
    			attr_dev(ul, "class", "uk-navbar-nav");
    			add_location(ul, file$8, 66, 4, 1557);
    			attr_dev(div0, "class", "uk-navbar-center svelte-4dp07p");
    			add_location(div0, file$8, 65, 2, 1521);
    			attr_dev(nav, "class", "uk-navbar-container svelte-4dp07p");
    			attr_dev(nav, "uk-nav", "");
    			add_location(nav, file$8, 64, 0, 1477);
    			attr_dev(h30, "class", "uk-card-title uk-margin-remove-bottom");
    			add_location(h30, file$8, 91, 10, 2309);
    			attr_dev(div1, "class", "uk-width-expand");
    			add_location(div1, file$8, 90, 8, 2268);
    			attr_dev(div2, "class", "uk-grid-small uk-flex-middle");
    			attr_dev(div2, "uk-grid", "");
    			add_location(div2, file$8, 89, 6, 2208);
    			attr_dev(div3, "class", "uk-card-header");
    			add_location(div3, file$8, 88, 4, 2172);
    			add_location(p0, file$8, 98, 6, 2496);
    			attr_dev(div4, "class", "uk-card-body");
    			add_location(div4, file$8, 97, 4, 2462);
    			attr_dev(div5, "class", "uk-card uk-card-default uk-child-width-1 uk-grid-match svelte-4dp07p");
    			add_location(div5, file$8, 87, 2, 2098);
    			attr_dev(img0, "class", "blekinge-img");
    			attr_dev(img0, "data-src", "../../images/blekinge.svg");
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "uk-svg", "");
    			add_location(img0, file$8, 108, 4, 2836);
    			attr_dev(div6, "class", "blekinge-map svelte-4dp07p");
    			add_location(div6, file$8, 107, 2, 2804);
    			if (img1.src !== (img1_src_value = "../../images/blekinge.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "uk-cover", "");
    			add_location(img1, file$8, 120, 6, 3139);
    			attr_dev(canvas, "width", "600");
    			attr_dev(canvas, "height", "400");
    			add_location(canvas, file$8, 121, 6, 3202);
    			attr_dev(div7, "class", "uk-card-media-left uk-cover-container");
    			add_location(div7, file$8, 119, 4, 3080);
    			attr_dev(h31, "class", "uk-card-title");
    			add_location(h31, file$8, 125, 8, 3304);
    			add_location(p1, file$8, 126, 8, 3353);
    			attr_dev(div8, "class", "uk-card-body");
    			add_location(div8, file$8, 124, 6, 3268);
    			add_location(div9, file$8, 123, 4, 3255);
    			attr_dev(div10, "class", "uk-card uk-card-default uk-grid-collapse  svelte-4dp07p");
    			attr_dev(div10, "uk-grid", "");
    			add_location(div10, file$8, 118, 2, 3011);
    			attr_dev(div11, "class", "flex-container svelte-4dp07p");
    			add_location(div11, file$8, 86, 0, 2066);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, t0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(a2, t4);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(a3, t6);
    			append_dev(ul, t7);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(a4, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div5);
    			append_dev(div5, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h30);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, p0);
    			append_dev(div4, t13);
    			mount_component(changebutton0, div4, null);
    			append_dev(div4, t14);
    			mount_component(changebutton1, div4, null);
    			append_dev(div4, t15);
    			mount_component(changebutton2, div4, null);
    			append_dev(div11, t16);
    			append_dev(div11, div6);
    			append_dev(div6, img0);
    			append_dev(div6, t17);
    			mount_component(hallevik, div6, null);
    			append_dev(div6, t18);
    			mount_component(jamshog, div6, null);
    			append_dev(div6, t19);
    			mount_component(torhamn, div6, null);
    			append_dev(div11, t20);
    			append_dev(div11, div10);
    			append_dev(div10, div7);
    			append_dev(div7, img1);
    			append_dev(div7, t21);
    			append_dev(div7, canvas);
    			append_dev(div10, t22);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h31);
    			append_dev(div8, t24);
    			append_dev(div8, p1);
    			insert_dev(target, t26, anchor);
    			mount_component(hallevikcity, target, anchor);
    			insert_dev(target, t27, anchor);
    			mount_component(jamshogcity, target, anchor);
    			insert_dev(target, t28, anchor);
    			mount_component(torhamncity, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$url*/ 1 && a0_href_value !== (a0_href_value = /*$url*/ ctx[0]("/"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a1_href_value !== (a1_href_value = /*$url*/ ctx[0]("/skane"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a2_href_value !== (a2_href_value = /*$url*/ ctx[0]("/blekinge"))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a3_href_value !== (a3_href_value = /*$url*/ ctx[0]("/kalmar"))) {
    				attr_dev(a3, "href", a3_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a4_href_value !== (a4_href_value = /*$url*/ ctx[0]("/stockholm"))) {
    				attr_dev(a4, "href", a4_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(changebutton0.$$.fragment, local);
    			transition_in(changebutton1.$$.fragment, local);
    			transition_in(changebutton2.$$.fragment, local);
    			transition_in(hallevik.$$.fragment, local);
    			transition_in(jamshog.$$.fragment, local);
    			transition_in(torhamn.$$.fragment, local);
    			transition_in(hallevikcity.$$.fragment, local);
    			transition_in(jamshogcity.$$.fragment, local);
    			transition_in(torhamncity.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(changebutton0.$$.fragment, local);
    			transition_out(changebutton1.$$.fragment, local);
    			transition_out(changebutton2.$$.fragment, local);
    			transition_out(hallevik.$$.fragment, local);
    			transition_out(jamshog.$$.fragment, local);
    			transition_out(torhamn.$$.fragment, local);
    			transition_out(hallevikcity.$$.fragment, local);
    			transition_out(jamshogcity.$$.fragment, local);
    			transition_out(torhamncity.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div11);
    			destroy_component(changebutton0);
    			destroy_component(changebutton1);
    			destroy_component(changebutton2);
    			destroy_component(hallevik);
    			destroy_component(jamshog);
    			destroy_component(torhamn);
    			if (detaching) detach_dev(t26);
    			destroy_component(hallevikcity, detaching);
    			if (detaching) detach_dev(t27);
    			destroy_component(jamshogcity, detaching);
    			if (detaching) detach_dev(t28);
    			destroy_component(torhamncity, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Blekinge> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Blekinge", $$slots, []);

    	$$self.$capture_state = () => ({
    		url,
    		Hallevik,
    		Jamshog,
    		Torhamn,
    		Audioplayer,
    		Changebutton,
    		HallevikCity: Hallevik_city,
    		JamshogCity: Jamshog_city,
    		TorhamnCity: Torhamn_city,
    		$url
    	});

    	return [$url];
    }

    class Blekinge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Blekinge",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\pages\markers\Skane-marker.svelte generated by Svelte v3.21.0 */

    const file$9 = "src\\pages\\markers\\Skane-marker.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let img;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "alt", "skane");
    			attr_dev(img, "class", "skane-marker uk-animation-scale-down svelte-1mvsz2u");
    			attr_dev(img, "data-src", "../images/marker-small.png");
    			attr_dev(img, "uk-img", "");
    			add_location(img, file$9, 15, 2, 219);
    			attr_dev(div, "class", "uk-animation-toggle svelte-1mvsz2u");
    			attr_dev(div, "tabindex", "0");
    			add_location(div, file$9, 14, 0, 169);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Skane_marker> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Skane_marker", $$slots, []);
    	return [];
    }

    class Skane_marker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skane_marker",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\pages\markers\Blekinge-marker.svelte generated by Svelte v3.21.0 */

    const file$a = "src\\pages\\markers\\Blekinge-marker.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let img;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "alt", "blekinge");
    			attr_dev(img, "class", "blekinge-marker uk-animation-scale-down svelte-8y6rm4");
    			attr_dev(img, "data-src", "../images/marker-small.png");
    			attr_dev(img, "uk-img", "");
    			add_location(img, file$a, 15, 2, 209);
    			attr_dev(div, "class", "uk-animation-toggle svelte-8y6rm4");
    			add_location(div, file$a, 14, 0, 172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Blekinge_marker> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Blekinge_marker", $$slots, []);
    	return [];
    }

    class Blekinge_marker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Blekinge_marker",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\pages\markers\Kalmar-marker.svelte generated by Svelte v3.21.0 */

    const file$b = "src\\pages\\markers\\Kalmar-marker.svelte";

    function create_fragment$f(ctx) {
    	let div;
    	let img;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "alt", "kalmar");
    			attr_dev(img, "class", "kalmar-marker uk-animation-scale-down svelte-1rj67iv");
    			attr_dev(img, "data-src", "../images/marker-small.png");
    			attr_dev(img, "uk-img", "");
    			add_location(img, file$b, 15, 2, 207);
    			attr_dev(div, "class", "uk-animation-toggle svelte-1rj67iv");
    			add_location(div, file$b, 14, 0, 170);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Kalmar_marker> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Kalmar_marker", $$slots, []);
    	return [];
    }

    class Kalmar_marker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Kalmar_marker",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\pages\markers\Stockholm-marker.svelte generated by Svelte v3.21.0 */

    const file$c = "src\\pages\\markers\\Stockholm-marker.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let img;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "alt", "stockholm");
    			attr_dev(img, "class", "stockholm-marker uk-animation-scale-down svelte-1m6qvhe");
    			attr_dev(img, "data-src", "../images/marker-small.png");
    			attr_dev(img, "uk-img", "");
    			add_location(img, file$c, 15, 2, 234);
    			attr_dev(div, "class", "uk-animation-toggle svelte-1m6qvhe");
    			add_location(div, file$c, 14, 0, 197);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Stockholm_marker> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Stockholm_marker", $$slots, []);
    	return [];
    }

    class Stockholm_marker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stockholm_marker",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\pages\index.svelte generated by Svelte v3.21.0 */
    const file$d = "src\\pages\\index.svelte";

    function create_fragment$h(ctx) {
    	let nav;
    	let div0;
    	let ul;
    	let li0;
    	let a0;
    	let t0;
    	let a0_href_value;
    	let t1;
    	let li1;
    	let a1;
    	let t2;
    	let a1_href_value;
    	let t3;
    	let li2;
    	let a2;
    	let t4;
    	let a2_href_value;
    	let t5;
    	let li3;
    	let a3;
    	let t6;
    	let a3_href_value;
    	let t7;
    	let li4;
    	let a4;
    	let t8;
    	let a4_href_value;
    	let t9;
    	let div5;
    	let div3;
    	let div2;
    	let div1;
    	let h3;
    	let t11;
    	let div4;
    	let p;
    	let t13;
    	let div6;
    	let img;
    	let t14;
    	let a5;
    	let a5_href_value;
    	let t15;
    	let a6;
    	let a6_href_value;
    	let t16;
    	let a7;
    	let a7_href_value;
    	let t17;
    	let a8;
    	let a8_href_value;
    	let current;
    	const stockholmmarker = new Stockholm_marker({ $$inline: true });
    	const kalmarmarker = new Kalmar_marker({ $$inline: true });
    	const blekingemarker = new Blekinge_marker({ $$inline: true });
    	const skanemarker = new Skane_marker({ $$inline: true });

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t0 = text("Startsida");
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			t2 = text("Skåne");
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			t4 = text("Blekinge");
    			t5 = space();
    			li3 = element("li");
    			a3 = element("a");
    			t6 = text("Kalmar");
    			t7 = space();
    			li4 = element("li");
    			a4 = element("a");
    			t8 = text("Stockholm");
    			t9 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			h3.textContent = "100 svenska dialekter";
    			t11 = space();
    			div4 = element("div");
    			p = element("p");
    			p.textContent = "Är du intresserad av dialekter? I så fall har du kommit rätt, för här kan\r\n      du lyssna på dialekter från hela det svenska språkområdet.";
    			t13 = space();
    			div6 = element("div");
    			img = element("img");
    			t14 = space();
    			a5 = element("a");
    			create_component(stockholmmarker.$$.fragment);
    			t15 = space();
    			a6 = element("a");
    			create_component(kalmarmarker.$$.fragment);
    			t16 = space();
    			a7 = element("a");
    			create_component(blekingemarker.$$.fragment);
    			t17 = space();
    			a8 = element("a");
    			create_component(skanemarker.$$.fragment);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[0]("/"));
    			attr_dev(a0, "class", "svelte-1dpvi9e");
    			add_location(a0, file$d, 48, 8, 1050);
    			attr_dev(li0, "class", "uk-parent svelte-1dpvi9e");
    			add_location(li0, file$d, 47, 6, 1018);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[0]("/skane"));
    			attr_dev(a1, "class", "svelte-1dpvi9e");
    			add_location(a1, file$d, 51, 8, 1136);
    			attr_dev(li1, "class", "uk-parent svelte-1dpvi9e");
    			add_location(li1, file$d, 50, 6, 1104);
    			attr_dev(a2, "href", a2_href_value = /*$url*/ ctx[0]("/blekinge"));
    			attr_dev(a2, "class", "svelte-1dpvi9e");
    			add_location(a2, file$d, 54, 8, 1223);
    			attr_dev(li2, "class", "uk-parent svelte-1dpvi9e");
    			add_location(li2, file$d, 53, 6, 1191);
    			attr_dev(a3, "href", a3_href_value = /*$url*/ ctx[0]("/kalmar"));
    			attr_dev(a3, "class", "svelte-1dpvi9e");
    			add_location(a3, file$d, 57, 8, 1316);
    			attr_dev(li3, "class", "uk-parent svelte-1dpvi9e");
    			add_location(li3, file$d, 56, 6, 1284);
    			attr_dev(a4, "href", a4_href_value = /*$url*/ ctx[0]("/stockholm"));
    			attr_dev(a4, "class", "svelte-1dpvi9e");
    			add_location(a4, file$d, 60, 8, 1405);
    			attr_dev(li4, "class", "uk-parent svelte-1dpvi9e");
    			add_location(li4, file$d, 59, 6, 1373);
    			attr_dev(ul, "class", "uk-navbar-nav");
    			add_location(ul, file$d, 46, 4, 984);
    			attr_dev(div0, "class", "uk-navbar-center svelte-1dpvi9e");
    			add_location(div0, file$d, 45, 2, 948);
    			attr_dev(nav, "class", "uk-navbar-container svelte-1dpvi9e");
    			attr_dev(nav, "uk-nav", "");
    			add_location(nav, file$d, 44, 0, 904);
    			attr_dev(h3, "class", "uk-card-title uk-margin-remove-bottom");
    			add_location(h3, file$d, 71, 8, 1682);
    			attr_dev(div1, "class", "uk-width-expand");
    			add_location(div1, file$d, 70, 6, 1643);
    			attr_dev(div2, "class", "uk-grid-small uk-flex-middle");
    			attr_dev(div2, "uk-grid", "");
    			add_location(div2, file$d, 69, 4, 1585);
    			attr_dev(div3, "class", "uk-card-header");
    			add_location(div3, file$d, 68, 2, 1551);
    			add_location(p, file$d, 78, 4, 1852);
    			attr_dev(div4, "class", "uk-card-body");
    			add_location(div4, file$d, 77, 2, 1820);
    			attr_dev(div5, "class", "uk-card uk-card-default uk-width-1-2@m svelte-1dpvi9e");
    			add_location(div5, file$d, 67, 0, 1495);
    			attr_dev(img, "class", "map-img svelte-1dpvi9e");
    			attr_dev(img, "data-src", "../images/sweden-map.svg");
    			attr_dev(img, "alt", "");
    			attr_dev(img, "uk-svg", "");
    			add_location(img, file$d, 86, 2, 2071);
    			attr_dev(a5, "href", a5_href_value = /*$url*/ ctx[0]("/stockholm"));
    			attr_dev(a5, "class", "nav-marker");
    			add_location(a5, file$d, 87, 2, 2148);
    			attr_dev(a6, "href", a6_href_value = /*$url*/ ctx[0]("/kalmar"));
    			attr_dev(a6, "class", "mark-nav");
    			add_location(a6, file$d, 90, 2, 2233);
    			attr_dev(a7, "href", a7_href_value = /*$url*/ ctx[0]("/blekinge"));
    			attr_dev(a7, "class", "mark-nav");
    			add_location(a7, file$d, 93, 2, 2310);
    			attr_dev(a8, "href", a8_href_value = /*$url*/ ctx[0]("/skane"));
    			attr_dev(a8, "class", "mark-nav");
    			add_location(a8, file$d, 96, 2, 2391);
    			attr_dev(div6, "class", "uk-container swemap svelte-1dpvi9e");
    			add_location(div6, file$d, 85, 0, 2034);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, t0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(a2, t4);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(a3, t6);
    			append_dev(ul, t7);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(a4, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, p);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, img);
    			append_dev(div6, t14);
    			append_dev(div6, a5);
    			mount_component(stockholmmarker, a5, null);
    			append_dev(div6, t15);
    			append_dev(div6, a6);
    			mount_component(kalmarmarker, a6, null);
    			append_dev(div6, t16);
    			append_dev(div6, a7);
    			mount_component(blekingemarker, a7, null);
    			append_dev(div6, t17);
    			append_dev(div6, a8);
    			mount_component(skanemarker, a8, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$url*/ 1 && a0_href_value !== (a0_href_value = /*$url*/ ctx[0]("/"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a1_href_value !== (a1_href_value = /*$url*/ ctx[0]("/skane"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a2_href_value !== (a2_href_value = /*$url*/ ctx[0]("/blekinge"))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a3_href_value !== (a3_href_value = /*$url*/ ctx[0]("/kalmar"))) {
    				attr_dev(a3, "href", a3_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a4_href_value !== (a4_href_value = /*$url*/ ctx[0]("/stockholm"))) {
    				attr_dev(a4, "href", a4_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a5_href_value !== (a5_href_value = /*$url*/ ctx[0]("/stockholm"))) {
    				attr_dev(a5, "href", a5_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a6_href_value !== (a6_href_value = /*$url*/ ctx[0]("/kalmar"))) {
    				attr_dev(a6, "href", a6_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a7_href_value !== (a7_href_value = /*$url*/ ctx[0]("/blekinge"))) {
    				attr_dev(a7, "href", a7_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a8_href_value !== (a8_href_value = /*$url*/ ctx[0]("/skane"))) {
    				attr_dev(a8, "href", a8_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stockholmmarker.$$.fragment, local);
    			transition_in(kalmarmarker.$$.fragment, local);
    			transition_in(blekingemarker.$$.fragment, local);
    			transition_in(skanemarker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stockholmmarker.$$.fragment, local);
    			transition_out(kalmarmarker.$$.fragment, local);
    			transition_out(blekingemarker.$$.fragment, local);
    			transition_out(skanemarker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div6);
    			destroy_component(stockholmmarker);
    			destroy_component(kalmarmarker);
    			destroy_component(blekingemarker);
    			destroy_component(skanemarker);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pages> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Pages", $$slots, []);

    	$$self.$capture_state = () => ({
    		url,
    		SkaneMarker: Skane_marker,
    		BlekingeMarker: Blekinge_marker,
    		KalmarMarker: Kalmar_marker,
    		StockholmMarker: Stockholm_marker,
    		$url
    	});

    	return [$url];
    }

    class Pages extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pages",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\pages\markers\citiesin\kalmar\Ankarsrum.svelte generated by Svelte v3.21.0 */
    const file$e = "src\\pages\\markers\\citiesin\\kalmar\\Ankarsrum.svelte";

    function create_fragment$i(ctx) {
    	let div0;
    	let a0;
    	let img0;
    	let t0;
    	let a1;
    	let img1;
    	let t1;
    	let div1;
    	let a2;
    	let img2;
    	let t2;
    	let a3;
    	let img3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			attr_dev(img0, "id", "youngwo-ankarsrum");
    			attr_dev(img0, "alt", "ankarsrum");
    			attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img0, "class", "ankarsrum-marker svelte-128x5x1");
    			attr_dev(img0, "data-src", "../images/marker-small.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$e, 30, 4, 680);
    			attr_dev(a0, "href", "#modal-youngwoman-ankarsrum");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$e, 29, 2, 626);
    			attr_dev(img1, "id", "youngm-ankarsrum");
    			attr_dev(img1, "alt", "ankarsrum");
    			attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img1, "class", "ankarsrum-marker svelte-128x5x1");
    			attr_dev(img1, "data-src", "../images/marker-small.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$e, 40, 4, 926);
    			attr_dev(a1, "href", "#modal-youngman-ankarsrum");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$e, 39, 2, 874);
    			attr_dev(div0, "id", "young-ankarsrum");
    			add_location(div0, file$e, 28, 0, 596);
    			attr_dev(img2, "id", "oldwo-ankarsrum");
    			attr_dev(img2, "alt", "ankarsrum");
    			attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img2, "class", "ankarsrum-marker svelte-128x5x1");
    			attr_dev(img2, "data-src", "../images/marker-small.png");
    			attr_dev(img2, "uk-img", "");
    			add_location(img2, file$e, 52, 4, 1205);
    			attr_dev(a2, "href", "#modal-oldwoman-ankarsrum");
    			attr_dev(a2, "uk-toggle", "");
    			add_location(a2, file$e, 51, 2, 1153);
    			attr_dev(img3, "id", "oldm-ankarsrum");
    			attr_dev(img3, "alt", "ankarsrum");
    			attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img3, "class", "ankarsrum-marker svelte-128x5x1");
    			attr_dev(img3, "data-src", "../images/marker-small.png");
    			attr_dev(img3, "uk-img", "");
    			add_location(img3, file$e, 62, 4, 1447);
    			attr_dev(a3, "href", "#modal-oldman-ankarsrum");
    			attr_dev(a3, "uk-toggle", "");
    			add_location(a3, file$e, 61, 2, 1397);
    			attr_dev(div1, "id", "old-ankarsrum");
    			add_location(div1, file$e, 50, 0, 1125);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { cityName } = $$props;
    	const writable_props = ["cityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Ankarsrum> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Ankarsrum", $$slots, []);

    	$$self.$set = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	$$self.$capture_state = () => ({ cityName, Audioplayer, Cardinfo });

    	$$self.$inject_state = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName];
    }

    class Ankarsrum extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { cityName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ankarsrum",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !("cityName" in props)) {
    			console.warn("<Ankarsrum> was created without expected prop 'cityName'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Ankarsrum>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Ankarsrum>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\kalmar-cities\ankarsrum-city.svelte generated by Svelte v3.21.0 */

    // (9:2) <Audioplayer      id="anakarsrum-yw"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/youngwoman.mp3">
    function create_default_slot_7$3(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Ankarsrum",
    				agetitle: "Ung",
    				gender: "kvinna",
    				city: "Ankarsrum"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$3.name,
    		type: "slot",
    		source: "(9:2) <Audioplayer      id=\\\"anakarsrum-yw\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/youngwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Modal modalid="modal-youngwoman-ankarsrum" modaltitle="Skåne">
    function create_default_slot_6$3(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "anakarsrum-yw",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/youngwoman.mp3",
    				$$slots: { default: [create_default_slot_7$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$3.name,
    		type: "slot",
    		source: "(8:0) <Modal modalid=\\\"modal-youngwoman-ankarsrum\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:2) <Audioplayer      id="ankarsrum-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/oldwoman.mp3">
    function create_default_slot_5$3(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Ankarsrum",
    				agetitle: "Äldre",
    				gender: "Kvinna",
    				city: "Ankarsrum"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$3.name,
    		type: "slot",
    		source: "(21:2) <Audioplayer      id=\\\"ankarsrum-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/oldwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:0) <Modal modalid="modal-oldwoman-ankarsrum" modaltitle="Skåne">
    function create_default_slot_4$3(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "ankarsrum-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/oldwoman.mp3",
    				$$slots: { default: [create_default_slot_5$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$3.name,
    		type: "slot",
    		source: "(20:0) <Modal modalid=\\\"modal-oldwoman-ankarsrum\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Audioplayer      id="ankarsrum-ow"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/youngman.mp3">
    function create_default_slot_3$3(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Ankarsrum",
    				agetitle: "Ung",
    				gender: "man",
    				city: "Ankarsrum"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$3.name,
    		type: "slot",
    		source: "(33:2) <Audioplayer      id=\\\"ankarsrum-ow\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/youngman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Modal modalid="modal-youngman-ankarsrum" modaltitle="Skåne">
    function create_default_slot_2$3(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "ankarsrum-ow",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/youngman.mp3",
    				$$slots: { default: [create_default_slot_3$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(32:0) <Modal modalid=\\\"modal-youngman-ankarsrum\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (41:2) <Audioplayer      id="ankarsrum-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/oldman.mp3">
    function create_default_slot_1$3(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Ankarsrum",
    				agetitle: "Äldre",
    				gender: "man",
    				city: "Ankarsrum"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(41:2) <Audioplayer      id=\\\"ankarsrum-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/oldman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (40:0) <Modal modalid="modal-oldman-ankarsrum" modaltitle="Skåne">
    function create_default_slot$4(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "ankarsrum-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/ankarsrum/oldman.mp3",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(40:0) <Modal modalid=\\\"modal-oldman-ankarsrum\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-youngwoman-ankarsrum",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_6$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-oldwoman-ankarsrum",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_4$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal2 = new Modal({
    			props: {
    				modalid: "modal-youngman-ankarsrum",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal3 = new Modal({
    			props: {
    				modalid: "modal-oldman-ankarsrum",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			create_component(modal2.$$.fragment);
    			t2 = space();
    			create_component(modal3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			modal2.$set(modal2_changes);
    			const modal3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal3_changes.$$scope = { dirty, ctx };
    			}

    			modal3.$set(modal3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			transition_in(modal3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			transition_out(modal3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Ankarsrum_city> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Ankarsrum_city", $$slots, []);

    	$$self.$capture_state = () => ({
    		Audioplayer,
    		Cardinfo,
    		Modal,
    		AnkarsrumMarker: Ankarsrum
    	});

    	return [];
    }

    class Ankarsrum_city extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ankarsrum_city",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\pages\markers\citiesin\kalmar\Torsas.svelte generated by Svelte v3.21.0 */
    const file$f = "src\\pages\\markers\\citiesin\\kalmar\\Torsas.svelte";

    function create_fragment$k(ctx) {
    	let div0;
    	let a0;
    	let img0;
    	let t0;
    	let a1;
    	let img1;
    	let t1;
    	let div1;
    	let a2;
    	let img2;
    	let t2;
    	let a3;
    	let img3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			attr_dev(img0, "id", "youngwo-torsas");
    			attr_dev(img0, "alt", "torsas");
    			attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img0, "class", "torsas-marker svelte-1qnjx4b");
    			attr_dev(img0, "data-src", "../images/marker-small.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$f, 30, 4, 650);
    			attr_dev(a0, "href", "#modal-youngwoman-torsas");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$f, 29, 2, 599);
    			attr_dev(img1, "id", "youngm-torsas");
    			attr_dev(img1, "alt", "torsas");
    			attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img1, "class", "torsas-marker svelte-1qnjx4b");
    			attr_dev(img1, "data-src", "../images/marker-small.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$f, 40, 4, 884);
    			attr_dev(a1, "href", "#modal-youngman-torsas");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$f, 39, 2, 835);
    			attr_dev(div0, "id", "young-torsas");
    			add_location(div0, file$f, 28, 0, 572);
    			attr_dev(img2, "id", "oldwo-torsas");
    			attr_dev(img2, "alt", "torsas");
    			attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img2, "class", "torsas-marker svelte-1qnjx4b");
    			attr_dev(img2, "data-src", "../images/marker-small.png");
    			attr_dev(img2, "uk-img", "");
    			add_location(img2, file$f, 52, 4, 1148);
    			attr_dev(a2, "href", "#modal-oldwoman-torsas");
    			attr_dev(a2, "uk-toggle", "");
    			add_location(a2, file$f, 51, 2, 1099);
    			attr_dev(img3, "id", "oldm-torsas");
    			attr_dev(img3, "alt", "torsas");
    			attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img3, "class", "torsas-marker svelte-1qnjx4b");
    			attr_dev(img3, "data-src", "../images/marker-small.png");
    			attr_dev(img3, "uk-img", "");
    			add_location(img3, file$f, 62, 4, 1378);
    			attr_dev(a3, "href", "#modal-oldman-torsas");
    			attr_dev(a3, "uk-toggle", "");
    			add_location(a3, file$f, 61, 2, 1331);
    			attr_dev(div1, "id", "old-torsas");
    			add_location(div1, file$f, 50, 0, 1074);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { cityName } = $$props;
    	const writable_props = ["cityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Torsas> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Torsas", $$slots, []);

    	$$self.$set = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	$$self.$capture_state = () => ({ cityName, Audioplayer, Cardinfo });

    	$$self.$inject_state = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName];
    }

    class Torsas extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { cityName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Torsas",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !("cityName" in props)) {
    			console.warn("<Torsas> was created without expected prop 'cityName'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Torsas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Torsas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\kalmar-cities\torsas-city.svelte generated by Svelte v3.21.0 */

    // (9:2) <Audioplayer      id="torsas-yw"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/youngwoman.mp3">
    function create_default_slot_7$4(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Torsås",
    				agetitle: "Ung",
    				gender: "kvinna",
    				city: "Torsås"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$4.name,
    		type: "slot",
    		source: "(9:2) <Audioplayer      id=\\\"torsas-yw\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/youngwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Modal modalid="modal-youngwoman-torsas" modaltitle="Skåne">
    function create_default_slot_6$4(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "torsas-yw",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/youngwoman.mp3",
    				$$slots: { default: [create_default_slot_7$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$4.name,
    		type: "slot",
    		source: "(8:0) <Modal modalid=\\\"modal-youngwoman-torsas\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Audioplayer      id="torsas-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/oldwoman.mp3">
    function create_default_slot_5$4(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Torsås",
    				agetitle: "Äldre",
    				gender: "kvinna",
    				city: "Torsås"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$4.name,
    		type: "slot",
    		source: "(17:2) <Audioplayer      id=\\\"torsas-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/oldwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Modal modalid="modal-oldwoman-torsas" modaltitle="Skåne">
    function create_default_slot_4$4(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "torsas-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/oldwoman.mp3",
    				$$slots: { default: [create_default_slot_5$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$4.name,
    		type: "slot",
    		source: "(16:0) <Modal modalid=\\\"modal-oldwoman-torsas\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:2) <Audioplayer      id="torsas-ow"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/youngman.mp3">
    function create_default_slot_3$4(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Torsås",
    				agetitle: "Ung",
    				gender: "man",
    				city: "Torsås"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$4.name,
    		type: "slot",
    		source: "(25:2) <Audioplayer      id=\\\"torsas-ow\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/youngman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:0) <Modal modalid="modal-youngman-torsas" modaltitle="Skåne">
    function create_default_slot_2$4(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "torsas-ow",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/youngman.mp3",
    				$$slots: { default: [create_default_slot_3$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$4.name,
    		type: "slot",
    		source: "(24:0) <Modal modalid=\\\"modal-youngman-torsas\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Audioplayer      id="torsas-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/oldman.mp3">
    function create_default_slot_1$4(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Torsås",
    				agetitle: "Äldre",
    				gender: "man",
    				city: "Torsås"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(33:2) <Audioplayer      id=\\\"torsas-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/oldman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Modal modalid="modal-oldman-torsas" modaltitle="Skåne">
    function create_default_slot$5(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "torsas-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/kalmar/torsas/oldman.mp3",
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(32:0) <Modal modalid=\\\"modal-oldman-torsas\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-youngwoman-torsas",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_6$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-oldwoman-torsas",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_4$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal2 = new Modal({
    			props: {
    				modalid: "modal-youngman-torsas",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal3 = new Modal({
    			props: {
    				modalid: "modal-oldman-torsas",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			create_component(modal2.$$.fragment);
    			t2 = space();
    			create_component(modal3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			modal2.$set(modal2_changes);
    			const modal3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal3_changes.$$scope = { dirty, ctx };
    			}

    			modal3.$set(modal3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			transition_in(modal3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			transition_out(modal3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Torsas_city> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Torsas_city", $$slots, []);

    	$$self.$capture_state = () => ({
    		Audioplayer,
    		Cardinfo,
    		Modal,
    		TorsasMarker: Torsas
    	});

    	return [];
    }

    class Torsas_city extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Torsas_city",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src\pages\kalmar.svelte generated by Svelte v3.21.0 */
    const file$g = "src\\pages\\kalmar.svelte";

    function create_fragment$m(ctx) {
    	let nav;
    	let div0;
    	let ul;
    	let li0;
    	let a0;
    	let t0;
    	let a0_href_value;
    	let t1;
    	let li1;
    	let a1;
    	let t2;
    	let a1_href_value;
    	let t3;
    	let li2;
    	let a2;
    	let t4;
    	let a2_href_value;
    	let t5;
    	let li3;
    	let a3;
    	let t6;
    	let a3_href_value;
    	let t7;
    	let li4;
    	let a4;
    	let t8;
    	let a4_href_value;
    	let t9;
    	let div11;
    	let div5;
    	let div3;
    	let div2;
    	let div1;
    	let h30;
    	let t11;
    	let div4;
    	let p0;
    	let t13;
    	let t14;
    	let t15;
    	let div6;
    	let img0;
    	let t16;
    	let t17;
    	let t18;
    	let div10;
    	let div7;
    	let img1;
    	let img1_src_value;
    	let t19;
    	let canvas;
    	let t20;
    	let div9;
    	let div8;
    	let h31;
    	let t22;
    	let p1;
    	let t24;
    	let t25;
    	let current;

    	const changebutton0 = new Changebutton({
    			props: {
    				targetCityName: "Ankarsrum",
    				targetCityId: "#old-ankarsrum"
    			},
    			$$inline: true
    		});

    	const changebutton1 = new Changebutton({
    			props: {
    				targetCityName: "Torsås",
    				targetCityId: "#old-torsas"
    			},
    			$$inline: true
    		});

    	const ankarsrummarker = new Ankarsrum({ $$inline: true });
    	const torsasmarker = new Torsas({ $$inline: true });
    	const ankarsrumcity = new Ankarsrum_city({ $$inline: true });
    	const torsascity = new Torsas_city({ $$inline: true });

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t0 = text("Startsida");
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			t2 = text("Skåne");
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			t4 = text("Blekinge");
    			t5 = space();
    			li3 = element("li");
    			a3 = element("a");
    			t6 = text("Kalmar");
    			t7 = space();
    			li4 = element("li");
    			a4 = element("a");
    			t8 = text("Stockholm");
    			t9 = space();
    			div11 = element("div");
    			div5 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Kalmar,storstadskomplex deluxe";
    			t11 = space();
    			div4 = element("div");
    			p0 = element("p");
    			p0.textContent = "Kalmar är stort o fint, och har öland som är nice på sommmaren.";
    			t13 = space();
    			create_component(changebutton0.$$.fragment);
    			t14 = space();
    			create_component(changebutton1.$$.fragment);
    			t15 = space();
    			div6 = element("div");
    			img0 = element("img");
    			t16 = space();
    			create_component(ankarsrummarker.$$.fragment);
    			t17 = space();
    			create_component(torsasmarker.$$.fragment);
    			t18 = space();
    			div10 = element("div");
    			div7 = element("div");
    			img1 = element("img");
    			t19 = space();
    			canvas = element("canvas");
    			t20 = space();
    			div9 = element("div");
    			div8 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Kalmar";
    			t22 = space();
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do\r\n          eiusmod tempor incididunt.";
    			t24 = space();
    			create_component(ankarsrumcity.$$.fragment);
    			t25 = space();
    			create_component(torsascity.$$.fragment);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[0]("/"));
    			attr_dev(a0, "class", "svelte-15n1abi");
    			add_location(a0, file$g, 65, 8, 1464);
    			attr_dev(li0, "class", "uk-parent svelte-15n1abi");
    			add_location(li0, file$g, 64, 6, 1432);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[0]("/skane"));
    			attr_dev(a1, "class", "svelte-15n1abi");
    			add_location(a1, file$g, 68, 8, 1550);
    			attr_dev(li1, "class", "uk-parent svelte-15n1abi");
    			add_location(li1, file$g, 67, 6, 1518);
    			attr_dev(a2, "href", a2_href_value = /*$url*/ ctx[0]("/blekinge"));
    			attr_dev(a2, "class", "svelte-15n1abi");
    			add_location(a2, file$g, 71, 8, 1637);
    			attr_dev(li2, "class", "uk-parent svelte-15n1abi");
    			add_location(li2, file$g, 70, 6, 1605);
    			attr_dev(a3, "href", a3_href_value = /*$url*/ ctx[0]("/kalmar"));
    			attr_dev(a3, "class", "svelte-15n1abi");
    			add_location(a3, file$g, 74, 8, 1730);
    			attr_dev(li3, "class", "uk-parent svelte-15n1abi");
    			add_location(li3, file$g, 73, 6, 1698);
    			attr_dev(a4, "href", a4_href_value = /*$url*/ ctx[0]("/stockholm"));
    			attr_dev(a4, "class", "svelte-15n1abi");
    			add_location(a4, file$g, 77, 8, 1819);
    			attr_dev(li4, "class", "uk-parent svelte-15n1abi");
    			add_location(li4, file$g, 76, 6, 1787);
    			attr_dev(ul, "class", "uk-navbar-nav");
    			add_location(ul, file$g, 63, 4, 1398);
    			attr_dev(div0, "class", "uk-navbar-center svelte-15n1abi");
    			add_location(div0, file$g, 62, 2, 1362);
    			attr_dev(nav, "class", "uk-navbar-container svelte-15n1abi");
    			attr_dev(nav, "uk-nav", "");
    			add_location(nav, file$g, 61, 0, 1318);
    			attr_dev(h30, "class", "uk-card-title uk-margin-remove-bottom");
    			add_location(h30, file$g, 88, 10, 2150);
    			attr_dev(div1, "class", "uk-width-expand");
    			add_location(div1, file$g, 87, 8, 2109);
    			attr_dev(div2, "class", "uk-grid-small uk-flex-middle");
    			attr_dev(div2, "uk-grid", "");
    			add_location(div2, file$g, 86, 6, 2049);
    			attr_dev(div3, "class", "uk-card-header");
    			add_location(div3, file$g, 85, 4, 2013);
    			add_location(p0, file$g, 95, 6, 2343);
    			attr_dev(div4, "class", "uk-card-body");
    			add_location(div4, file$g, 94, 4, 2309);
    			attr_dev(div5, "class", "uk-card uk-card-default uk-child-width-1 uk-grid-match svelte-15n1abi");
    			add_location(div5, file$g, 84, 2, 1939);
    			attr_dev(img0, "class", "kalmar-img");
    			attr_dev(img0, "data-src", "../../images/kalmar.svg");
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "uk-svg", "");
    			add_location(img0, file$g, 104, 4, 2631);
    			attr_dev(div6, "class", "kalmar-map svelte-15n1abi");
    			add_location(div6, file$g, 103, 2, 2601);
    			if (img1.src !== (img1_src_value = "./../images/kalmar.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "uk-cover", "");
    			add_location(img1, file$g, 111, 6, 2897);
    			attr_dev(canvas, "width", "600");
    			attr_dev(canvas, "height", "400");
    			add_location(canvas, file$g, 112, 6, 2957);
    			attr_dev(div7, "class", "uk-card-media-left uk-cover-container");
    			add_location(div7, file$g, 110, 4, 2838);
    			attr_dev(h31, "class", "uk-card-title");
    			add_location(h31, file$g, 116, 8, 3059);
    			add_location(p1, file$g, 117, 8, 3106);
    			attr_dev(div8, "class", "uk-card-body");
    			add_location(div8, file$g, 115, 6, 3023);
    			add_location(div9, file$g, 114, 4, 3010);
    			attr_dev(div10, "class", "uk-card uk-card-default uk-grid-collapse  svelte-15n1abi");
    			attr_dev(div10, "uk-grid", "");
    			add_location(div10, file$g, 109, 2, 2769);
    			attr_dev(div11, "class", "flex-container svelte-15n1abi");
    			add_location(div11, file$g, 83, 0, 1907);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, t0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(a2, t4);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(a3, t6);
    			append_dev(ul, t7);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(a4, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div5);
    			append_dev(div5, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h30);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, p0);
    			append_dev(div4, t13);
    			mount_component(changebutton0, div4, null);
    			append_dev(div4, t14);
    			mount_component(changebutton1, div4, null);
    			append_dev(div11, t15);
    			append_dev(div11, div6);
    			append_dev(div6, img0);
    			append_dev(div6, t16);
    			mount_component(ankarsrummarker, div6, null);
    			append_dev(div6, t17);
    			mount_component(torsasmarker, div6, null);
    			append_dev(div11, t18);
    			append_dev(div11, div10);
    			append_dev(div10, div7);
    			append_dev(div7, img1);
    			append_dev(div7, t19);
    			append_dev(div7, canvas);
    			append_dev(div10, t20);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h31);
    			append_dev(div8, t22);
    			append_dev(div8, p1);
    			insert_dev(target, t24, anchor);
    			mount_component(ankarsrumcity, target, anchor);
    			insert_dev(target, t25, anchor);
    			mount_component(torsascity, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$url*/ 1 && a0_href_value !== (a0_href_value = /*$url*/ ctx[0]("/"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a1_href_value !== (a1_href_value = /*$url*/ ctx[0]("/skane"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a2_href_value !== (a2_href_value = /*$url*/ ctx[0]("/blekinge"))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a3_href_value !== (a3_href_value = /*$url*/ ctx[0]("/kalmar"))) {
    				attr_dev(a3, "href", a3_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a4_href_value !== (a4_href_value = /*$url*/ ctx[0]("/stockholm"))) {
    				attr_dev(a4, "href", a4_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(changebutton0.$$.fragment, local);
    			transition_in(changebutton1.$$.fragment, local);
    			transition_in(ankarsrummarker.$$.fragment, local);
    			transition_in(torsasmarker.$$.fragment, local);
    			transition_in(ankarsrumcity.$$.fragment, local);
    			transition_in(torsascity.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(changebutton0.$$.fragment, local);
    			transition_out(changebutton1.$$.fragment, local);
    			transition_out(ankarsrummarker.$$.fragment, local);
    			transition_out(torsasmarker.$$.fragment, local);
    			transition_out(ankarsrumcity.$$.fragment, local);
    			transition_out(torsascity.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div11);
    			destroy_component(changebutton0);
    			destroy_component(changebutton1);
    			destroy_component(ankarsrummarker);
    			destroy_component(torsasmarker);
    			if (detaching) detach_dev(t24);
    			destroy_component(ankarsrumcity, detaching);
    			if (detaching) detach_dev(t25);
    			destroy_component(torsascity, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Kalmar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Kalmar", $$slots, []);

    	$$self.$capture_state = () => ({
    		url,
    		AnkarsrumMarker: Ankarsrum,
    		TorsasMarker: Torsas,
    		Audioplayer,
    		Changebutton,
    		AnkarsrumCity: Ankarsrum_city,
    		TorsasCity: Torsas_city,
    		$url
    	});

    	return [$url];
    }

    class Kalmar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Kalmar",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src\pages\markers\citiesin\skane\Bara.svelte generated by Svelte v3.21.0 */
    const file$h = "src\\pages\\markers\\citiesin\\skane\\Bara.svelte";

    function create_fragment$n(ctx) {
    	let div0;
    	let a0;
    	let img0;
    	let t0;
    	let a1;
    	let img1;
    	let t1;
    	let div1;
    	let a2;
    	let img2;
    	let t2;
    	let a3;
    	let img3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			attr_dev(img0, "id", "youngwo-bara");
    			attr_dev(img0, "alt", "bara");
    			attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img0, "class", "bara-marker svelte-qg2ut3");
    			attr_dev(img0, "data-src", "../images/marker-small.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$h, 32, 4, 634);
    			attr_dev(a0, "href", "#modal-youngwoman-bara");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$h, 31, 2, 585);
    			attr_dev(img1, "id", "youngm-bara");
    			attr_dev(img1, "alt", "bara");
    			attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img1, "class", "bara-marker svelte-qg2ut3");
    			attr_dev(img1, "data-src", "../images/marker-small.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$h, 42, 4, 860);
    			attr_dev(a1, "href", "#modal-youngman-bara");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$h, 41, 2, 813);
    			attr_dev(div0, "id", "young-bara");
    			add_location(div0, file$h, 30, 0, 560);
    			attr_dev(img2, "id", "oldwo-bara");
    			attr_dev(img2, "alt", "bara");
    			attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img2, "class", "bara-marker svelte-qg2ut3");
    			attr_dev(img2, "data-src", "../images/marker-small.png");
    			attr_dev(img2, "uk-img", "");
    			add_location(img2, file$h, 54, 4, 1114);
    			attr_dev(a2, "href", "#modal-oldwoman-bara");
    			attr_dev(a2, "uk-toggle", "");
    			add_location(a2, file$h, 53, 2, 1067);
    			attr_dev(img3, "id", "oldm-bara");
    			attr_dev(img3, "alt", "bara");
    			attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img3, "class", "bara-marker svelte-qg2ut3");
    			attr_dev(img3, "data-src", "../images/marker-small.png");
    			attr_dev(img3, "uk-img", "");
    			add_location(img3, file$h, 64, 4, 1336);
    			attr_dev(a3, "href", "#modal-oldman-bara");
    			attr_dev(a3, "uk-toggle", "");
    			add_location(a3, file$h, 63, 2, 1291);
    			attr_dev(div1, "id", "old-bara");
    			add_location(div1, file$h, 52, 0, 1044);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { cityName } = $$props;
    	const writable_props = ["cityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Bara> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Bara", $$slots, []);

    	$$self.$set = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	$$self.$capture_state = () => ({ cityName, Audioplayer, Cardinfo });

    	$$self.$inject_state = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName];
    }

    class Bara extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { cityName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bara",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !("cityName" in props)) {
    			console.warn("<Bara> was created without expected prop 'cityName'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Bara>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Bara>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\markers\citiesin\skane\Bjuv.svelte generated by Svelte v3.21.0 */
    const file$i = "src\\pages\\markers\\citiesin\\skane\\Bjuv.svelte";

    function create_fragment$o(ctx) {
    	let div0;
    	let a0;
    	let img0;
    	let t0;
    	let a1;
    	let img1;
    	let t1;
    	let div1;
    	let a2;
    	let img2;
    	let t2;
    	let a3;
    	let img3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			attr_dev(img0, "id", "youngwo-bjuv");
    			attr_dev(img0, "alt", "bjuv");
    			attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img0, "class", "bjuv-marker svelte-1idb7hn");
    			attr_dev(img0, "data-src", "../images/marker-small.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$i, 32, 4, 634);
    			attr_dev(a0, "href", "#modal-youngwoman-bjuv");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$i, 31, 2, 585);
    			attr_dev(img1, "id", "youngm-bjuv");
    			attr_dev(img1, "alt", "bjuv");
    			attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img1, "class", "bjuv-marker svelte-1idb7hn");
    			attr_dev(img1, "data-src", "../images/marker-small.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$i, 42, 4, 860);
    			attr_dev(a1, "href", "#modal-youngman-bjuv");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$i, 41, 2, 813);
    			attr_dev(div0, "id", "young-bjuv");
    			add_location(div0, file$i, 30, 0, 560);
    			attr_dev(img2, "id", "oldwo-bjuv");
    			attr_dev(img2, "alt", "bjuv");
    			attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img2, "class", "bjuv-marker svelte-1idb7hn");
    			attr_dev(img2, "data-src", "../images/marker-small.png");
    			attr_dev(img2, "uk-img", "");
    			add_location(img2, file$i, 54, 4, 1114);
    			attr_dev(a2, "href", "#modal-oldwoman-bjuv");
    			attr_dev(a2, "uk-toggle", "");
    			add_location(a2, file$i, 53, 2, 1067);
    			attr_dev(img3, "id", "oldm-bjuv");
    			attr_dev(img3, "alt", "bjuv");
    			attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img3, "class", "bjuv-marker svelte-1idb7hn");
    			attr_dev(img3, "data-src", "../images/marker-small.png");
    			attr_dev(img3, "uk-img", "");
    			add_location(img3, file$i, 64, 4, 1336);
    			attr_dev(a3, "href", "#modal-oldman-bjuv");
    			attr_dev(a3, "uk-toggle", "");
    			add_location(a3, file$i, 63, 2, 1291);
    			attr_dev(div1, "id", "old-bjuv");
    			add_location(div1, file$i, 52, 0, 1044);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { cityName } = $$props;
    	const writable_props = ["cityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Bjuv> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Bjuv", $$slots, []);

    	$$self.$set = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	$$self.$capture_state = () => ({ cityName, Audioplayer, Cardinfo });

    	$$self.$inject_state = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName];
    }

    class Bjuv extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { cityName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bjuv",
    			options,
    			id: create_fragment$o.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !("cityName" in props)) {
    			console.warn("<Bjuv> was created without expected prop 'cityName'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Bjuv>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Bjuv>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\markers\citiesin\skane\Broby.svelte generated by Svelte v3.21.0 */
    const file$j = "src\\pages\\markers\\citiesin\\skane\\Broby.svelte";

    function create_fragment$p(ctx) {
    	let div0;
    	let a0;
    	let img0;
    	let t0;
    	let a1;
    	let img1;
    	let t1;
    	let div1;
    	let a2;
    	let img2;
    	let t2;
    	let a3;
    	let img3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			attr_dev(img0, "id", "youngwo-broby");
    			attr_dev(img0, "alt", "broby");
    			attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img0, "class", "broby-marker svelte-kuvcni");
    			attr_dev(img0, "data-src", "../images/marker-small.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$j, 31, 4, 642);
    			attr_dev(a0, "href", "#modal-youngwoman-broby");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$j, 30, 2, 592);
    			attr_dev(img1, "id", "youngm-broby");
    			attr_dev(img1, "alt", "broby");
    			attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img1, "class", "broby-marker svelte-kuvcni");
    			attr_dev(img1, "data-src", "../images/marker-small.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$j, 41, 4, 872);
    			attr_dev(a1, "href", "#modal-youngman-broby");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$j, 40, 2, 824);
    			attr_dev(div0, "id", "young-broby");
    			add_location(div0, file$j, 29, 0, 566);
    			attr_dev(img2, "id", "oldwo-broby");
    			attr_dev(img2, "alt", "broby");
    			attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img2, "class", "broby-marker svelte-kuvcni");
    			attr_dev(img2, "data-src", "../images/marker-small.png");
    			attr_dev(img2, "uk-img", "");
    			add_location(img2, file$j, 53, 4, 1131);
    			attr_dev(a2, "href", "#modal-oldwoman-broby");
    			attr_dev(a2, "uk-toggle", "");
    			add_location(a2, file$j, 52, 2, 1083);
    			attr_dev(img3, "id", "oldm-broby");
    			attr_dev(img3, "alt", "broby");
    			attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img3, "class", "broby-marker svelte-kuvcni");
    			attr_dev(img3, "data-src", "../images/marker-small.png");
    			attr_dev(img3, "uk-img", "");
    			add_location(img3, file$j, 63, 4, 1357);
    			attr_dev(a3, "href", "#modal-oldman-broby");
    			attr_dev(a3, "uk-toggle", "");
    			add_location(a3, file$j, 62, 2, 1311);
    			attr_dev(div1, "id", "old-broby");
    			add_location(div1, file$j, 51, 0, 1059);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { cityName } = $$props;
    	const writable_props = ["cityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Broby> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Broby", $$slots, []);

    	$$self.$set = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	$$self.$capture_state = () => ({ cityName, Audioplayer, Cardinfo });

    	$$self.$inject_state = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName];
    }

    class Broby extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { cityName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Broby",
    			options,
    			id: create_fragment$p.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !("cityName" in props)) {
    			console.warn("<Broby> was created without expected prop 'cityName'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Broby>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Broby>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\markers\citiesin\skane\easteregg.svelte generated by Svelte v3.21.0 */
    const file$k = "src\\pages\\markers\\citiesin\\skane\\easteregg.svelte";

    function create_fragment$q(ctx) {
    	let a0;
    	let img0;
    	let t;
    	let a1;
    	let img1;

    	const block = {
    		c: function create() {
    			a0 = element("a");
    			img0 = element("img");
    			t = space();
    			a1 = element("a");
    			img1 = element("img");
    			attr_dev(img0, "id", "youngm-malmo");
    			attr_dev(img0, "alt", "bjuv");
    			attr_dev(img0, "uk-tooltip", "Jag är kungen, du vet.");
    			attr_dev(img0, "class", "king-marker svelte-6lkncp");
    			attr_dev(img0, "data-src", "../images/king.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$k, 25, 2, 482);
    			attr_dev(a0, "href", "#modal-king");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$k, 24, 0, 446);
    			attr_dev(img1, "id", "oldm-skaneland");
    			attr_dev(img1, "alt", "bjuv");
    			attr_dev(img1, "uk-tooltip", "den har powör");
    			attr_dev(img1, "class", "bone-marker svelte-6lkncp");
    			attr_dev(img1, "data-src", "../images/power.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$k, 35, 2, 687);
    			attr_dev(a1, "href", "#modal-bone");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$k, 34, 0, 651);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a0, anchor);
    			append_dev(a0, img0);
    			insert_dev(target, t, anchor);
    			insert_dev(target, a1, anchor);
    			append_dev(a1, img1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(a1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Easteregg> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Easteregg", $$slots, []);
    	$$self.$capture_state = () => ({ Audioplayer, Cardinfo });
    	return [];
    }

    class Easteregg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Easteregg",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src\pages\markers\citiesin\skane\Loderup.svelte generated by Svelte v3.21.0 */
    const file$l = "src\\pages\\markers\\citiesin\\skane\\Loderup.svelte";

    function create_fragment$r(ctx) {
    	let div0;
    	let a0;
    	let img0;
    	let t0;
    	let a1;
    	let img1;
    	let t1;
    	let div1;
    	let a2;
    	let img2;
    	let t2;
    	let a3;
    	let img3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			attr_dev(img0, "id", "youngwo-loderup");
    			attr_dev(img0, "alt", "loderup");
    			attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img0, "class", "loderup-marker svelte-w0714w");
    			attr_dev(img0, "data-src", "../images/marker-small.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$l, 32, 4, 664);
    			attr_dev(a0, "href", "#modal-youngwoman-loderup");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$l, 31, 2, 612);
    			attr_dev(img1, "id", "youngm-loderup");
    			attr_dev(img1, "alt", "loderup");
    			attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img1, "class", "loderup-marker svelte-w0714w");
    			attr_dev(img1, "data-src", "../images/marker-small.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$l, 42, 4, 902);
    			attr_dev(a1, "href", "#modal-youngman-loderup");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$l, 41, 2, 852);
    			attr_dev(div0, "id", "young-loderup");
    			add_location(div0, file$l, 30, 0, 584);
    			attr_dev(img2, "id", "oldwo-loderup");
    			attr_dev(img2, "alt", "loderup");
    			attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img2, "class", "loderup-marker svelte-w0714w");
    			attr_dev(img2, "data-src", "../images/marker-small.png");
    			attr_dev(img2, "uk-img", "");
    			add_location(img2, file$l, 54, 4, 1171);
    			attr_dev(a2, "href", "#modal-oldwoman-loderup");
    			attr_dev(a2, "uk-toggle", "");
    			add_location(a2, file$l, 53, 2, 1121);
    			attr_dev(img3, "id", "oldm-loderup");
    			attr_dev(img3, "alt", "loderup");
    			attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img3, "class", "loderup-marker svelte-w0714w");
    			attr_dev(img3, "data-src", "../images/marker-small.png");
    			attr_dev(img3, "uk-img", "");
    			add_location(img3, file$l, 64, 4, 1405);
    			attr_dev(a3, "href", "#modal-oldman-loderup");
    			attr_dev(a3, "uk-toggle", "");
    			add_location(a3, file$l, 63, 2, 1357);
    			attr_dev(div1, "id", "old-loderup");
    			add_location(div1, file$l, 52, 0, 1095);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { cityName } = $$props;
    	const writable_props = ["cityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loderup> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Loderup", $$slots, []);

    	$$self.$set = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	$$self.$capture_state = () => ({ cityName, Audioplayer, Cardinfo });

    	$$self.$inject_state = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName];
    }

    class Loderup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, { cityName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loderup",
    			options,
    			id: create_fragment$r.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !("cityName" in props)) {
    			console.warn("<Loderup> was created without expected prop 'cityName'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Loderup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Loderup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\markers\citiesin\skane\Norrarorom.svelte generated by Svelte v3.21.0 */
    const file$m = "src\\pages\\markers\\citiesin\\skane\\Norrarorom.svelte";

    function create_fragment$s(ctx) {
    	let div0;
    	let a0;
    	let img0;
    	let t0;
    	let a1;
    	let img1;
    	let t1;
    	let div1;
    	let a2;
    	let img2;
    	let t2;
    	let a3;
    	let img3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			attr_dev(img0, "id", "youngwo-norrarorom");
    			attr_dev(img0, "alt", "norrarorom");
    			attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img0, "class", "norrarorom-marker svelte-ckbi0y");
    			attr_dev(img0, "data-src", "../images/marker-small.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$m, 32, 4, 694);
    			attr_dev(a0, "href", "#modal-youngwoman-norrarorom");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$m, 31, 2, 639);
    			attr_dev(img1, "id", "youngm-norrarorom");
    			attr_dev(img1, "alt", "norrarorom");
    			attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img1, "class", "norrarorom-marker svelte-ckbi0y");
    			attr_dev(img1, "data-src", "../images/marker-small.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$m, 42, 4, 944);
    			attr_dev(a1, "href", "#modal-youngman-norrarorom");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$m, 41, 2, 891);
    			attr_dev(div0, "id", "young-norrarorom");
    			add_location(div0, file$m, 30, 0, 608);
    			attr_dev(img2, "id", "oldwo-norrarorom");
    			attr_dev(img2, "alt", "norrarorom");
    			attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img2, "class", "norrarorom-marker svelte-ckbi0y");
    			attr_dev(img2, "data-src", "../images/marker-small.png");
    			attr_dev(img2, "uk-img", "");
    			add_location(img2, file$m, 54, 4, 1228);
    			attr_dev(a2, "href", "#modal-oldwoman-norrarorom");
    			attr_dev(a2, "uk-toggle", "");
    			add_location(a2, file$m, 53, 2, 1175);
    			attr_dev(img3, "id", "oldm-norrarorom");
    			attr_dev(img3, "alt", "norrarorom");
    			attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img3, "class", "norrarorom-marker svelte-ckbi0y");
    			attr_dev(img3, "data-src", "../images/marker-small.png");
    			attr_dev(img3, "uk-img", "");
    			add_location(img3, file$m, 64, 4, 1474);
    			attr_dev(a3, "href", "#modal-oldman-norrarorom");
    			attr_dev(a3, "uk-toggle", "");
    			add_location(a3, file$m, 63, 2, 1423);
    			attr_dev(div1, "id", "old-norrarorom");
    			add_location(div1, file$m, 52, 0, 1146);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { cityName } = $$props;
    	const writable_props = ["cityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Norrarorom> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Norrarorom", $$slots, []);

    	$$self.$set = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	$$self.$capture_state = () => ({ cityName, Audioplayer, Cardinfo });

    	$$self.$inject_state = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName];
    }

    class Norrarorom extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, { cityName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Norrarorom",
    			options,
    			id: create_fragment$s.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !("cityName" in props)) {
    			console.warn("<Norrarorom> was created without expected prop 'cityName'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Norrarorom>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Norrarorom>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\markers\citiesin\skane\Osssjo.svelte generated by Svelte v3.21.0 */
    const file$n = "src\\pages\\markers\\citiesin\\skane\\Osssjo.svelte";

    function create_fragment$t(ctx) {
    	let div0;
    	let a0;
    	let img0;
    	let t0;
    	let a1;
    	let img1;
    	let t1;
    	let div1;
    	let a2;
    	let img2;
    	let t2;
    	let a3;
    	let img3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			attr_dev(img0, "id", "youngwo-osssjo");
    			attr_dev(img0, "alt", "osssjo");
    			attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img0, "class", "osssjo-marker svelte-7lmr10");
    			attr_dev(img0, "data-src", "../images/marker-small.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$n, 32, 4, 654);
    			attr_dev(a0, "href", "#modal-youngwoman-osssjo");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$n, 31, 2, 603);
    			attr_dev(img1, "id", "youngm-osssjo");
    			attr_dev(img1, "alt", "osssjo");
    			attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img1, "class", "osssjo-marker svelte-7lmr10");
    			attr_dev(img1, "data-src", "../images/marker-small.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$n, 42, 4, 888);
    			attr_dev(a1, "href", "#modal-youngman-osssjo");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$n, 41, 2, 839);
    			attr_dev(div0, "id", "young-osssjo");
    			add_location(div0, file$n, 30, 0, 576);
    			attr_dev(img2, "id", "oldwo-osssjo");
    			attr_dev(img2, "alt", "osssjo");
    			attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img2, "class", "osssjo-marker svelte-7lmr10");
    			attr_dev(img2, "data-src", "../images/marker-small.png");
    			attr_dev(img2, "uk-img", "");
    			add_location(img2, file$n, 54, 4, 1152);
    			attr_dev(a2, "href", "#modal-oldwoman-osssjo");
    			attr_dev(a2, "uk-toggle", "");
    			add_location(a2, file$n, 53, 2, 1103);
    			attr_dev(img3, "id", "oldm-osssjo");
    			attr_dev(img3, "alt", "osssjo");
    			attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img3, "class", "osssjo-marker svelte-7lmr10");
    			attr_dev(img3, "data-src", "../images/marker-small.png");
    			attr_dev(img3, "uk-img", "");
    			add_location(img3, file$n, 64, 4, 1382);
    			attr_dev(a3, "href", "#modal-oldman-osssjo");
    			attr_dev(a3, "uk-toggle", "");
    			add_location(a3, file$n, 63, 2, 1335);
    			attr_dev(div1, "id", "old-osssjo");
    			add_location(div1, file$n, 52, 0, 1078);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let { cityName } = $$props;
    	const writable_props = ["cityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Osssjo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Osssjo", $$slots, []);

    	$$self.$set = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	$$self.$capture_state = () => ({ cityName, Audioplayer, Cardinfo });

    	$$self.$inject_state = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName];
    }

    class Osssjo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, { cityName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Osssjo",
    			options,
    			id: create_fragment$t.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !("cityName" in props)) {
    			console.warn("<Osssjo> was created without expected prop 'cityName'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Osssjo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Osssjo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\markers\citiesin\stockholm\Lanna.svelte generated by Svelte v3.21.0 */
    const file$o = "src\\pages\\markers\\citiesin\\stockholm\\Lanna.svelte";

    function create_fragment$u(ctx) {
    	let div0;
    	let a0;
    	let img0;
    	let t0;
    	let a1;
    	let img1;
    	let t1;
    	let div1;
    	let a2;
    	let img2;
    	let t2;
    	let a3;
    	let img3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			attr_dev(img0, "id", "youngwo-lanna");
    			attr_dev(img0, "alt", "lanna");
    			attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img0, "class", "lanna-marker svelte-1rjv9gh");
    			attr_dev(img0, "data-src", "../images/marker-small.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$o, 30, 4, 640);
    			attr_dev(a0, "href", "#modal-youngwoman-lanna");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$o, 29, 2, 590);
    			attr_dev(img1, "id", "youngm-lanna");
    			attr_dev(img1, "alt", "lanna");
    			attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img1, "class", "lanna-marker svelte-1rjv9gh");
    			attr_dev(img1, "data-src", "../images/marker-small.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$o, 40, 4, 870);
    			attr_dev(a1, "href", "#modal-youngman-lanna");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$o, 39, 2, 822);
    			attr_dev(div0, "id", "young-lanna");
    			add_location(div0, file$o, 28, 0, 564);
    			attr_dev(img2, "id", "oldwo-lanna");
    			attr_dev(img2, "alt", "lanna");
    			attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img2, "class", "lanna-marker svelte-1rjv9gh");
    			attr_dev(img2, "data-src", "../images/marker-small.png");
    			attr_dev(img2, "uk-img", "");
    			add_location(img2, file$o, 52, 4, 1129);
    			attr_dev(a2, "href", "#modal-oldwoman-lanna");
    			attr_dev(a2, "uk-toggle", "");
    			add_location(a2, file$o, 51, 2, 1081);
    			attr_dev(img3, "id", "oldm-lanna");
    			attr_dev(img3, "alt", "lanna");
    			attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img3, "class", "lanna-marker svelte-1rjv9gh");
    			attr_dev(img3, "data-src", "../images/marker-small.png");
    			attr_dev(img3, "uk-img", "");
    			add_location(img3, file$o, 62, 4, 1355);
    			attr_dev(a3, "href", "#modal-oldman-lanna");
    			attr_dev(a3, "uk-toggle", "");
    			add_location(a3, file$o, 61, 2, 1309);
    			attr_dev(div1, "id", "old-lanna");
    			add_location(div1, file$o, 50, 0, 1057);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let { cityName } = $$props;
    	const writable_props = ["cityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lanna> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Lanna", $$slots, []);

    	$$self.$set = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	$$self.$capture_state = () => ({ cityName, Audioplayer, Cardinfo });

    	$$self.$inject_state = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName];
    }

    class Lanna extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, { cityName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lanna",
    			options,
    			id: create_fragment$u.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !("cityName" in props)) {
    			console.warn("<Lanna> was created without expected prop 'cityName'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Lanna>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Lanna>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\markers\citiesin\stockholm\Sorunda.svelte generated by Svelte v3.21.0 */
    const file$p = "src\\pages\\markers\\citiesin\\stockholm\\Sorunda.svelte";

    function create_fragment$v(ctx) {
    	let div0;
    	let a0;
    	let img0;
    	let t0;
    	let a1;
    	let img1;
    	let t1;
    	let div1;
    	let a2;
    	let img2;
    	let t2;
    	let a3;
    	let img3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			attr_dev(img0, "id", "youngwo-sorunda");
    			attr_dev(img0, "alt", "sorunda");
    			attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img0, "class", "sorunda-marker svelte-m6y185");
    			attr_dev(img0, "data-src", "../images/marker-small.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$p, 30, 4, 660);
    			attr_dev(a0, "href", "#modal-youngwoman-sorunda");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$p, 29, 2, 608);
    			attr_dev(img1, "id", "youngm-sorunda");
    			attr_dev(img1, "alt", "sorunda");
    			attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img1, "class", "sorunda-marker svelte-m6y185");
    			attr_dev(img1, "data-src", "../images/marker-small.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$p, 40, 4, 898);
    			attr_dev(a1, "href", "#modal-youngman-sorunda");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$p, 39, 2, 848);
    			attr_dev(div0, "id", "young-sorunda");
    			add_location(div0, file$p, 28, 0, 580);
    			attr_dev(img2, "id", "oldwo-sorunda");
    			attr_dev(img2, "alt", "sorunda");
    			attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img2, "class", "sorunda-marker svelte-m6y185");
    			attr_dev(img2, "data-src", "../images/marker-small.png");
    			attr_dev(img2, "uk-img", "");
    			add_location(img2, file$p, 52, 4, 1167);
    			attr_dev(a2, "href", "#modal-oldwoman-sorunda");
    			attr_dev(a2, "uk-toggle", "");
    			add_location(a2, file$p, 51, 2, 1117);
    			attr_dev(img3, "id", "oldm-sorunda");
    			attr_dev(img3, "alt", "sorunda");
    			attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img3, "class", "sorunda-marker svelte-m6y185");
    			attr_dev(img3, "data-src", "../images/marker-small.png");
    			attr_dev(img3, "uk-img", "");
    			add_location(img3, file$p, 62, 4, 1401);
    			attr_dev(a3, "href", "#modal-oldman-sorunda");
    			attr_dev(a3, "uk-toggle", "");
    			add_location(a3, file$p, 61, 2, 1353);
    			attr_dev(div1, "id", "old-sorunda");
    			add_location(div1, file$p, 50, 0, 1091);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let { cityName } = $$props;
    	const writable_props = ["cityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sorunda> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Sorunda", $$slots, []);

    	$$self.$set = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	$$self.$capture_state = () => ({ cityName, Audioplayer, Cardinfo });

    	$$self.$inject_state = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName];
    }

    class Sorunda extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, { cityName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sorunda",
    			options,
    			id: create_fragment$v.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !("cityName" in props)) {
    			console.warn("<Sorunda> was created without expected prop 'cityName'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Sorunda>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Sorunda>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\markers\citiesin\stockholm\Vvingaker.svelte generated by Svelte v3.21.0 */
    const file$q = "src\\pages\\markers\\citiesin\\stockholm\\Vvingaker.svelte";

    function create_fragment$w(ctx) {
    	let div0;
    	let a0;
    	let img0;
    	let t0;
    	let a1;
    	let img1;
    	let t1;
    	let div1;
    	let a2;
    	let img2;
    	let t2;
    	let a3;
    	let img3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a2 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a3 = element("a");
    			img3 = element("img");
    			attr_dev(img0, "id", "youngwo-vingaker");
    			attr_dev(img0, "alt", "vingaker");
    			attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img0, "class", "vingaker-marker svelte-1guvgwx");
    			attr_dev(img0, "data-src", "../images/marker-small.png");
    			attr_dev(img0, "uk-img", "");
    			add_location(img0, file$q, 30, 4, 670);
    			attr_dev(a0, "href", "#modal-youngwoman-vingaker");
    			attr_dev(a0, "uk-toggle", "");
    			add_location(a0, file$q, 29, 2, 617);
    			attr_dev(img1, "id", "youngm-vingaker");
    			attr_dev(img1, "alt", "vingaker");
    			attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img1, "class", "vingaker-marker svelte-1guvgwx");
    			attr_dev(img1, "data-src", "../images/marker-small.png");
    			attr_dev(img1, "uk-img", "");
    			add_location(img1, file$q, 40, 4, 912);
    			attr_dev(a1, "href", "#modal-youngman-vingaker");
    			attr_dev(a1, "uk-toggle", "");
    			add_location(a1, file$q, 39, 2, 861);
    			attr_dev(div0, "id", "young-vingaker");
    			add_location(div0, file$q, 28, 0, 588);
    			attr_dev(img2, "id", "oldwo-vingaker");
    			attr_dev(img2, "alt", "vingaker");
    			attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img2, "class", "vingaker-marker svelte-1guvgwx");
    			attr_dev(img2, "data-src", "../images/marker-small.png");
    			attr_dev(img2, "uk-img", "");
    			add_location(img2, file$q, 52, 4, 1186);
    			attr_dev(a2, "href", "#modal-oldwoman-vingaker");
    			attr_dev(a2, "uk-toggle", "");
    			add_location(a2, file$q, 51, 2, 1135);
    			attr_dev(img3, "id", "oldm-vingaker");
    			attr_dev(img3, "alt", "vingaker");
    			attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			attr_dev(img3, "class", "vingaker-marker svelte-1guvgwx");
    			attr_dev(img3, "data-src", "../images/marker-small.png");
    			attr_dev(img3, "uk-img", "");
    			add_location(img3, file$q, 62, 4, 1424);
    			attr_dev(a3, "href", "#modal-oldman-vingaker");
    			attr_dev(a3, "uk-toggle", "");
    			add_location(a3, file$q, 61, 2, 1375);
    			attr_dev(div1, "id", "old-vingaker");
    			add_location(div1, file$q, 50, 0, 1108);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t2);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img0, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img1, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img2, "uk-tooltip", /*cityName*/ ctx[0]);
    			}

    			if (dirty & /*cityName*/ 1) {
    				attr_dev(img3, "uk-tooltip", /*cityName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let { cityName } = $$props;
    	const writable_props = ["cityName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Vvingaker> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Vvingaker", $$slots, []);

    	$$self.$set = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	$$self.$capture_state = () => ({ cityName, Audioplayer, Cardinfo });

    	$$self.$inject_state = $$props => {
    		if ("cityName" in $$props) $$invalidate(0, cityName = $$props.cityName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName];
    }

    class Vvingaker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, { cityName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vvingaker",
    			options,
    			id: create_fragment$w.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !("cityName" in props)) {
    			console.warn("<Vvingaker> was created without expected prop 'cityName'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Vvingaker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Vvingaker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\skane-cities\bara-city.svelte generated by Svelte v3.21.0 */

    // (9:2) <Audioplayer      id="bara-yw"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/youngwoman.mp3">
    function create_default_slot_7$5(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Bara",
    				agetitle: "Ung",
    				gender: "kvinna",
    				city: "Bara"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$5.name,
    		type: "slot",
    		source: "(9:2) <Audioplayer      id=\\\"bara-yw\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/youngwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Modal modalid="modal-youngwoman-bara" modaltitle="Skåne">
    function create_default_slot_6$5(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "bara-yw",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/youngwoman.mp3",
    				$$slots: { default: [create_default_slot_7$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$5.name,
    		type: "slot",
    		source: "(8:0) <Modal modalid=\\\"modal-youngwoman-bara\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Audioplayer      id="bara-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/oldwoman.mp3">
    function create_default_slot_5$5(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Bara",
    				agetitle: "Äldre",
    				gender: "kvinna",
    				city: "Bara"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$5.name,
    		type: "slot",
    		source: "(17:2) <Audioplayer      id=\\\"bara-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/oldwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Modal modalid="modal-oldwoman-bara" modaltitle="Skåne">
    function create_default_slot_4$5(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "bara-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/oldwoman.mp3",
    				$$slots: { default: [create_default_slot_5$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$5.name,
    		type: "slot",
    		source: "(16:0) <Modal modalid=\\\"modal-oldwoman-bara\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:2) <Audioplayer      id="bara-ow"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/youngman.mp3">
    function create_default_slot_3$5(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Bara",
    				agetitle: "Ung",
    				gender: "man",
    				city: "Bara"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$5.name,
    		type: "slot",
    		source: "(25:2) <Audioplayer      id=\\\"bara-ow\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/youngman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:0) <Modal modalid="modal-youngman-bara" modaltitle="Skåne">
    function create_default_slot_2$5(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "bara-ow",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/youngman.mp3",
    				$$slots: { default: [create_default_slot_3$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$5.name,
    		type: "slot",
    		source: "(24:0) <Modal modalid=\\\"modal-youngman-bara\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Audioplayer      id="bara-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/oldman.mp3">
    function create_default_slot_1$5(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Bara",
    				agetitle: "Äldre",
    				gender: "man",
    				city: "Bara"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$5.name,
    		type: "slot",
    		source: "(33:2) <Audioplayer      id=\\\"bara-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/oldman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Modal modalid="modal-oldman-bara" modaltitle="Skåne">
    function create_default_slot$6(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "bara-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bara/oldman.mp3",
    				$$slots: { default: [create_default_slot_1$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(32:0) <Modal modalid=\\\"modal-oldman-bara\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$x(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-youngwoman-bara",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_6$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-oldwoman-bara",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_4$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal2 = new Modal({
    			props: {
    				modalid: "modal-youngman-bara",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal3 = new Modal({
    			props: {
    				modalid: "modal-oldman-bara",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			create_component(modal2.$$.fragment);
    			t2 = space();
    			create_component(modal3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			modal2.$set(modal2_changes);
    			const modal3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal3_changes.$$scope = { dirty, ctx };
    			}

    			modal3.$set(modal3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			transition_in(modal3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			transition_out(modal3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Bara_city> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Bara_city", $$slots, []);
    	$$self.$capture_state = () => ({ Audioplayer, Cardinfo, Modal, BaraMarker: Bara });
    	return [];
    }

    class Bara_city extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bara_city",
    			options,
    			id: create_fragment$x.name
    		});
    	}
    }

    /* src\pages\skane-cities\bjuv-city.svelte generated by Svelte v3.21.0 */

    // (9:2) <Audioplayer      id="bjuv-yw"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/youngwoman.mp3">
    function create_default_slot_7$6(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Bjuv",
    				agetitle: "Ung",
    				gender: "kvinna",
    				city: "Bjuv"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$6.name,
    		type: "slot",
    		source: "(9:2) <Audioplayer      id=\\\"bjuv-yw\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/youngwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Modal modalid="modal-youngwoman-bjuv" modaltitle="Skåne">
    function create_default_slot_6$6(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "bjuv-yw",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/youngwoman.mp3",
    				$$slots: { default: [create_default_slot_7$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$6.name,
    		type: "slot",
    		source: "(8:0) <Modal modalid=\\\"modal-youngwoman-bjuv\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Audioplayer      id="bjuv-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/oldwoman.mp3">
    function create_default_slot_5$6(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Bjuv",
    				agetitle: "Äldre",
    				gender: "kvinna",
    				city: "Bjuv"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$6.name,
    		type: "slot",
    		source: "(17:2) <Audioplayer      id=\\\"bjuv-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/oldwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Modal modalid="modal-oldwoman-bjuv" modaltitle="Skåne">
    function create_default_slot_4$6(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "bjuv-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/oldwoman.mp3",
    				$$slots: { default: [create_default_slot_5$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$6.name,
    		type: "slot",
    		source: "(16:0) <Modal modalid=\\\"modal-oldwoman-bjuv\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:2) <Audioplayer      id="bjuv-ow"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/youngman.mp3">
    function create_default_slot_3$6(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Bjuv",
    				agetitle: "Ung",
    				gender: "man",
    				city: "Bjuv"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$6.name,
    		type: "slot",
    		source: "(25:2) <Audioplayer      id=\\\"bjuv-ow\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/youngman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:0) <Modal modalid="modal-youngman-bjuv" modaltitle="Skåne">
    function create_default_slot_2$6(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "bjuv-ow",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/youngman.mp3",
    				$$slots: { default: [create_default_slot_3$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$6.name,
    		type: "slot",
    		source: "(24:0) <Modal modalid=\\\"modal-youngman-bjuv\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Audioplayer      id="bjuv-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/oldman.mp3">
    function create_default_slot_1$6(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Bjuv",
    				agetitle: "Äldre",
    				gender: "man",
    				city: "Bjuv"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$6.name,
    		type: "slot",
    		source: "(33:2) <Audioplayer      id=\\\"bjuv-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/oldman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Modal modalid="modal-oldman-bjuv" modaltitle="Skåne">
    function create_default_slot$7(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "bjuv-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bjuv/oldman.mp3",
    				$$slots: { default: [create_default_slot_1$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(32:0) <Modal modalid=\\\"modal-oldman-bjuv\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$y(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-youngwoman-bjuv",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_6$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-oldwoman-bjuv",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_4$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal2 = new Modal({
    			props: {
    				modalid: "modal-youngman-bjuv",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal3 = new Modal({
    			props: {
    				modalid: "modal-oldman-bjuv",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			create_component(modal2.$$.fragment);
    			t2 = space();
    			create_component(modal3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			modal2.$set(modal2_changes);
    			const modal3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal3_changes.$$scope = { dirty, ctx };
    			}

    			modal3.$set(modal3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			transition_in(modal3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			transition_out(modal3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$y($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Bjuv_city> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Bjuv_city", $$slots, []);
    	$$self.$capture_state = () => ({ Audioplayer, Cardinfo, Modal, BjuvMarker: Bjuv });
    	return [];
    }

    class Bjuv_city extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bjuv_city",
    			options,
    			id: create_fragment$y.name
    		});
    	}
    }

    /* src\pages\skane-cities\broby-city.svelte generated by Svelte v3.21.0 */

    // (9:2) <Audioplayer      id="broby-yw"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/youngwoman.mp3">
    function create_default_slot_7$7(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Broby",
    				agetitle: "Ung",
    				gender: "kvinna",
    				city: "Broby"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$7.name,
    		type: "slot",
    		source: "(9:2) <Audioplayer      id=\\\"broby-yw\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/youngwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Modal modalid="modal-youngwoman-broby" modaltitle="Skåne">
    function create_default_slot_6$7(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "broby-yw",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/youngwoman.mp3",
    				$$slots: { default: [create_default_slot_7$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$7.name,
    		type: "slot",
    		source: "(8:0) <Modal modalid=\\\"modal-youngwoman-broby\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Audioplayer      id="broby-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/youngman.mp3">
    function create_default_slot_5$7(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Broby",
    				agetitle: "Ung",
    				gender: "man",
    				city: "Broby"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$7.name,
    		type: "slot",
    		source: "(17:2) <Audioplayer      id=\\\"broby-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/youngman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Modal modalid="modal-youngman-broby" modaltitle="Skåne">
    function create_default_slot_4$7(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "broby-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/youngman.mp3",
    				$$slots: { default: [create_default_slot_5$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$7.name,
    		type: "slot",
    		source: "(16:0) <Modal modalid=\\\"modal-youngman-broby\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:2) <Audioplayer      id="broby-ow"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/oldwoman.mp3">
    function create_default_slot_3$7(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Broby",
    				agetitle: "Äldre",
    				gender: "kvinna",
    				city: "Broby"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$7.name,
    		type: "slot",
    		source: "(25:2) <Audioplayer      id=\\\"broby-ow\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/oldwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:0) <Modal modalid="modal-oldwoman-broby" modaltitle="Skåne">
    function create_default_slot_2$7(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "broby-ow",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/oldwoman.mp3",
    				$$slots: { default: [create_default_slot_3$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$7.name,
    		type: "slot",
    		source: "(24:0) <Modal modalid=\\\"modal-oldwoman-broby\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Audioplayer      id="broby-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/oldman.mp3">
    function create_default_slot_1$7(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Broby",
    				agetitle: "Äldre",
    				gender: "man",
    				city: "Broby"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$7.name,
    		type: "slot",
    		source: "(33:2) <Audioplayer      id=\\\"broby-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/oldman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Modal modalid="modal-oldman-broby" modaltitle="Skåne">
    function create_default_slot$8(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "broby-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/broby/oldman.mp3",
    				$$slots: { default: [create_default_slot_1$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(32:0) <Modal modalid=\\\"modal-oldman-broby\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$z(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-youngwoman-broby",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_6$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-youngman-broby",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_4$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal2 = new Modal({
    			props: {
    				modalid: "modal-oldwoman-broby",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal3 = new Modal({
    			props: {
    				modalid: "modal-oldman-broby",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			create_component(modal2.$$.fragment);
    			t2 = space();
    			create_component(modal3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			modal2.$set(modal2_changes);
    			const modal3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal3_changes.$$scope = { dirty, ctx };
    			}

    			modal3.$set(modal3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			transition_in(modal3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			transition_out(modal3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$z($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Broby_city> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Broby_city", $$slots, []);

    	$$self.$capture_state = () => ({
    		Audioplayer,
    		Cardinfo,
    		Modal,
    		BrobyMarker: Broby
    	});

    	return [];
    }

    class Broby_city extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Broby_city",
    			options,
    			id: create_fragment$z.name
    		});
    	}
    }

    /* src\pages\skane-cities\easteregg-modal.svelte generated by Svelte v3.21.0 */

    // (10:2) <Audioplayer      id="malmo-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/kungen.mp3">
    function create_default_slot_3$8(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Malmö",
    				agetitle: "Ung och Kung",
    				gender: "Man",
    				city: "Malmö"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$8.name,
    		type: "slot",
    		source: "(10:2) <Audioplayer      id=\\\"malmo-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/kungen.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (9:0) <Modal modalid="modal-king" modaltitle="Skåne">
    function create_default_slot_2$8(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "malmo-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/kungen.mp3",
    				$$slots: { default: [create_default_slot_3$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$8.name,
    		type: "slot",
    		source: "(9:0) <Modal modalid=\\\"modal-king\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (18:2) <Audioplayer      id="skaneland-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bone.mp3">
    function create_default_slot_1$8(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Skåne Land",
    				agetitle: "Äldre man med traktor",
    				gender: "",
    				city: "Skåne Land"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$8.name,
    		type: "slot",
    		source: "(18:2) <Audioplayer      id=\\\"skaneland-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bone.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:0) <Modal modalid="modal-bone" modaltitle="Skåne Land">
    function create_default_slot$9(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "skaneland-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/bone.mp3",
    				$$slots: { default: [create_default_slot_1$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(17:0) <Modal modalid=\\\"modal-bone\\\" modaltitle=\\\"Skåne Land\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$A(ctx) {
    	let t;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-king",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-bone",
    				modaltitle: "Skåne Land",
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t = space();
    			create_component(modal1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(modal1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(modal1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$A($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Easteregg_modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Easteregg_modal", $$slots, []);

    	$$self.$capture_state = () => ({
    		Audioplayer,
    		Cardinfo,
    		Modal,
    		KingMarker: Easteregg,
    		BoneMarker: Easteregg
    	});

    	return [];
    }

    class Easteregg_modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Easteregg_modal",
    			options,
    			id: create_fragment$A.name
    		});
    	}
    }

    /* src\pages\skane-cities\loderup-city.svelte generated by Svelte v3.21.0 */

    // (9:2) <Audioplayer      id="loderup-yw"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/youngwoman.mp3">
    function create_default_slot_7$8(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Löderup",
    				agetitle: "Ung",
    				gender: "kvinna",
    				city: "Löderup"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$8.name,
    		type: "slot",
    		source: "(9:2) <Audioplayer      id=\\\"loderup-yw\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/youngwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Modal modalid="modal-youngwoman-loderup" modaltitle="Skåne">
    function create_default_slot_6$8(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "loderup-yw",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/youngwoman.mp3",
    				$$slots: { default: [create_default_slot_7$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$8.name,
    		type: "slot",
    		source: "(8:0) <Modal modalid=\\\"modal-youngwoman-loderup\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Audioplayer      id="loderup-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/youngman.mp3">
    function create_default_slot_5$8(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Löderup",
    				agetitle: "Ung",
    				gender: "man",
    				city: "Löderup"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$8.name,
    		type: "slot",
    		source: "(17:2) <Audioplayer      id=\\\"loderup-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/youngman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Modal modalid="modal-youngman-loderup" modaltitle="Skåne">
    function create_default_slot_4$8(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "loderup-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/youngman.mp3",
    				$$slots: { default: [create_default_slot_5$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$8.name,
    		type: "slot",
    		source: "(16:0) <Modal modalid=\\\"modal-youngman-loderup\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:2) <Audioplayer      id="loderup-ow"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/oldwoman.mp3">
    function create_default_slot_3$9(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Löderup",
    				agetitle: "Äldre",
    				gender: "kvinna",
    				city: "Löderup"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$9.name,
    		type: "slot",
    		source: "(25:2) <Audioplayer      id=\\\"loderup-ow\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/oldwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:0) <Modal modalid="modal-oldwoman-loderup" modaltitle="Skåne">
    function create_default_slot_2$9(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "loderup-ow",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/oldwoman.mp3",
    				$$slots: { default: [create_default_slot_3$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$9.name,
    		type: "slot",
    		source: "(24:0) <Modal modalid=\\\"modal-oldwoman-loderup\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Audioplayer      id="loderup-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/oldman.mp3">
    function create_default_slot_1$9(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Löderup",
    				agetitle: "Äldre",
    				gender: "man",
    				city: "Löderup"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$9.name,
    		type: "slot",
    		source: "(33:2) <Audioplayer      id=\\\"loderup-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/oldman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Modal modalid="modal-oldman-loderup" modaltitle="Skåne">
    function create_default_slot$a(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "loderup-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/loderup/oldman.mp3",
    				$$slots: { default: [create_default_slot_1$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$a.name,
    		type: "slot",
    		source: "(32:0) <Modal modalid=\\\"modal-oldman-loderup\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$B(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-youngwoman-loderup",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_6$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-youngman-loderup",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_4$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal2 = new Modal({
    			props: {
    				modalid: "modal-oldwoman-loderup",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal3 = new Modal({
    			props: {
    				modalid: "modal-oldman-loderup",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			create_component(modal2.$$.fragment);
    			t2 = space();
    			create_component(modal3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			modal2.$set(modal2_changes);
    			const modal3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal3_changes.$$scope = { dirty, ctx };
    			}

    			modal3.$set(modal3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			transition_in(modal3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			transition_out(modal3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$B($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loderup_city> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Loderup_city", $$slots, []);

    	$$self.$capture_state = () => ({
    		Audioplayer,
    		Cardinfo,
    		Modal,
    		LoderupMarker: Loderup
    	});

    	return [];
    }

    class Loderup_city extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loderup_city",
    			options,
    			id: create_fragment$B.name
    		});
    	}
    }

    /* src\pages\skane-cities\norrarorom-city.svelte generated by Svelte v3.21.0 */

    // (9:2) <Audioplayer      id="norrarorom-yw"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/youngwoman.mp3">
    function create_default_slot_7$9(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Norra Rörum",
    				agetitle: "Ung",
    				gender: "kvinna",
    				city: "Norra Rörum"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$9.name,
    		type: "slot",
    		source: "(9:2) <Audioplayer      id=\\\"norrarorom-yw\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/youngwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Modal modalid="modal-youngwoman-norrarorom" modaltitle="Skåne">
    function create_default_slot_6$9(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "norrarorom-yw",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/youngwoman.mp3",
    				$$slots: { default: [create_default_slot_7$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$9.name,
    		type: "slot",
    		source: "(8:0) <Modal modalid=\\\"modal-youngwoman-norrarorom\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:2) <Audioplayer      id="norrarorom-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/youngman.mp3">
    function create_default_slot_5$9(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Norra Rörum",
    				agetitle: "Ung",
    				gender: "man",
    				city: "Norra Rörum"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$9.name,
    		type: "slot",
    		source: "(21:2) <Audioplayer      id=\\\"norrarorom-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/youngman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:0) <Modal modalid="modal-youngman-norrarorom" modaltitle="Skåne">
    function create_default_slot_4$9(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "norrarorom-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/youngman.mp3",
    				$$slots: { default: [create_default_slot_5$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$9.name,
    		type: "slot",
    		source: "(20:0) <Modal modalid=\\\"modal-youngman-norrarorom\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Audioplayer      id="norrarorom-ow"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/oldwoman.mp3">
    function create_default_slot_3$a(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Norra Rörum",
    				agetitle: "Äldre",
    				gender: "kvinna",
    				city: "Norra Rörum"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$a.name,
    		type: "slot",
    		source: "(33:2) <Audioplayer      id=\\\"norrarorom-ow\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/oldwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Modal modalid="modal-oldwoman-norrarorom" modaltitle="Skåne">
    function create_default_slot_2$a(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "norrarorom-ow",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/oldwoman.mp3",
    				$$slots: { default: [create_default_slot_3$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$a.name,
    		type: "slot",
    		source: "(32:0) <Modal modalid=\\\"modal-oldwoman-norrarorom\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (45:2) <Audioplayer      id="norrarorom-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/oldman.mp3">
    function create_default_slot_1$a(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Norra Rörum",
    				agetitle: "Äldre",
    				gender: "man",
    				city: "Norra Rörum"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$a.name,
    		type: "slot",
    		source: "(45:2) <Audioplayer      id=\\\"norrarorom-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/oldman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (44:0) <Modal modalid="modal-oldman-norrarorom" modaltitle="Skåne">
    function create_default_slot$b(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "norrarorom-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/norrarorom/oldman.mp3",
    				$$slots: { default: [create_default_slot_1$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$b.name,
    		type: "slot",
    		source: "(44:0) <Modal modalid=\\\"modal-oldman-norrarorom\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$C(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-youngwoman-norrarorom",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_6$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-youngman-norrarorom",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_4$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal2 = new Modal({
    			props: {
    				modalid: "modal-oldwoman-norrarorom",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal3 = new Modal({
    			props: {
    				modalid: "modal-oldman-norrarorom",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			create_component(modal2.$$.fragment);
    			t2 = space();
    			create_component(modal3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			modal2.$set(modal2_changes);
    			const modal3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal3_changes.$$scope = { dirty, ctx };
    			}

    			modal3.$set(modal3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			transition_in(modal3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			transition_out(modal3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$C.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$C($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Norrarorom_city> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Norrarorom_city", $$slots, []);

    	$$self.$capture_state = () => ({
    		Audioplayer,
    		Cardinfo,
    		Modal,
    		NorraroromMarker: Norrarorom
    	});

    	return [];
    }

    class Norrarorom_city extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Norrarorom_city",
    			options,
    			id: create_fragment$C.name
    		});
    	}
    }

    /* src\pages\skane-cities\osssjo-city.svelte generated by Svelte v3.21.0 */

    // (9:2) <Audioplayer      id="osssjo-yw"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/youngwoman.mp3">
    function create_default_slot_7$a(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Osssjö",
    				agetitle: "Ung",
    				gender: "kvinna",
    				city: "Osssjö"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$a.name,
    		type: "slot",
    		source: "(9:2) <Audioplayer      id=\\\"osssjo-yw\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/youngwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Modal modalid="modal-youngwoman-osssjo" modaltitle="Skåne">
    function create_default_slot_6$a(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "osssjo-yw",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/youngwoman.mp3",
    				$$slots: { default: [create_default_slot_7$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$a.name,
    		type: "slot",
    		source: "(8:0) <Modal modalid=\\\"modal-youngwoman-osssjo\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Audioplayer      id="osssjo-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/youngman.mp3">
    function create_default_slot_5$a(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Össjö",
    				agetitle: "Ung",
    				gender: "man",
    				city: "Össjö"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$a.name,
    		type: "slot",
    		source: "(17:2) <Audioplayer      id=\\\"osssjo-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/youngman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Modal modalid="modal-youngman-osssjo" modaltitle="Skåne">
    function create_default_slot_4$a(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "osssjo-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/youngman.mp3",
    				$$slots: { default: [create_default_slot_5$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$a.name,
    		type: "slot",
    		source: "(16:0) <Modal modalid=\\\"modal-youngman-osssjo\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:2) <Audioplayer      id="osssjo-ow"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/oldwoman.mp3">
    function create_default_slot_3$b(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Össjö",
    				agetitle: "Äldre",
    				gender: "kvinna",
    				city: "Össjö"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$b.name,
    		type: "slot",
    		source: "(25:2) <Audioplayer      id=\\\"osssjo-ow\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/oldwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:0) <Modal modalid="modal-oldwoman-osssjo" modaltitle="Skåne">
    function create_default_slot_2$b(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "osssjo-ow",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/oldwoman.mp3",
    				$$slots: { default: [create_default_slot_3$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$b.name,
    		type: "slot",
    		source: "(24:0) <Modal modalid=\\\"modal-oldwoman-osssjo\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Audioplayer      id="osssjo-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/oldman.mp3">
    function create_default_slot_1$b(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Össjö",
    				agetitle: "Äldre",
    				gender: "man",
    				city: "Össjö"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$b.name,
    		type: "slot",
    		source: "(33:2) <Audioplayer      id=\\\"osssjo-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/oldman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Modal modalid="modal-oldman-osssjo" modaltitle="Skåne">
    function create_default_slot$c(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "osssjo-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/skane/osssjo/oldman.mp3",
    				$$slots: { default: [create_default_slot_1$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$c.name,
    		type: "slot",
    		source: "(32:0) <Modal modalid=\\\"modal-oldman-osssjo\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$D(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-youngwoman-osssjo",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_6$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-youngman-osssjo",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_4$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal2 = new Modal({
    			props: {
    				modalid: "modal-oldwoman-osssjo",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal3 = new Modal({
    			props: {
    				modalid: "modal-oldman-osssjo",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			create_component(modal2.$$.fragment);
    			t2 = space();
    			create_component(modal3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			modal2.$set(modal2_changes);
    			const modal3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal3_changes.$$scope = { dirty, ctx };
    			}

    			modal3.$set(modal3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			transition_in(modal3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			transition_out(modal3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$D.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$D($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Osssjo_city> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Osssjo_city", $$slots, []);

    	$$self.$capture_state = () => ({
    		Audioplayer,
    		Cardinfo,
    		Modal,
    		OsssjoMarker: Osssjo
    	});

    	return [];
    }

    class Osssjo_city extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Osssjo_city",
    			options,
    			id: create_fragment$D.name
    		});
    	}
    }

    /* src\pages\skane.svelte generated by Svelte v3.21.0 */
    const file$r = "src\\pages\\skane.svelte";

    function create_fragment$E(ctx) {
    	let nav;
    	let div0;
    	let ul;
    	let li0;
    	let a0;
    	let t0;
    	let a0_href_value;
    	let t1;
    	let li1;
    	let a1;
    	let t2;
    	let a1_href_value;
    	let t3;
    	let li2;
    	let a2;
    	let t4;
    	let a2_href_value;
    	let t5;
    	let li3;
    	let a3;
    	let t6;
    	let a3_href_value;
    	let t7;
    	let li4;
    	let a4;
    	let t8;
    	let a4_href_value;
    	let t9;
    	let div11;
    	let div5;
    	let div3;
    	let div2;
    	let div1;
    	let h30;
    	let t11;
    	let div4;
    	let p0;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let t17;
    	let t18;
    	let t19;
    	let div6;
    	let img0;
    	let t20;
    	let t21;
    	let t22;
    	let t23;
    	let t24;
    	let t25;
    	let t26;
    	let t27;
    	let t28;
    	let div10;
    	let div7;
    	let img1;
    	let img1_src_value;
    	let t29;
    	let canvas;
    	let t30;
    	let div9;
    	let div8;
    	let h31;
    	let t32;
    	let p1;
    	let t34;
    	let t35;
    	let t36;
    	let t37;
    	let t38;
    	let t39;
    	let t40;
    	let current;

    	const changebutton0 = new Changebutton({
    			props: {
    				targetCityName: "Bjuv",
    				targetCityId: "#old-bjuv"
    			},
    			$$inline: true
    		});

    	const changebutton1 = new Changebutton({
    			props: {
    				targetCityName: "Bara",
    				targetCityId: "#old-bara"
    			},
    			$$inline: true
    		});

    	const changebutton2 = new Changebutton({
    			props: {
    				targetCityName: "Broby",
    				targetCityId: "#old-broby"
    			},
    			$$inline: true
    		});

    	const changebutton3 = new Changebutton({
    			props: {
    				targetCityName: "Löderup",
    				targetCityId: "#old-loderup"
    			},
    			$$inline: true
    		});

    	const changebutton4 = new Changebutton({
    			props: {
    				targetCityName: "Norra rörum",
    				targetCityId: "#old-norrarorom"
    			},
    			$$inline: true
    		});

    	const changebutton5 = new Changebutton({
    			props: {
    				targetCityName: "Össsjö",
    				targetCityId: "#old-osssjo"
    			},
    			$$inline: true
    		});

    	const bara = new Bara({
    			props: { cityName: "Bara" },
    			$$inline: true
    		});

    	const bjuv = new Bjuv({
    			props: { cityName: "Bjuv" },
    			$$inline: true
    		});

    	const broby = new Broby({ $$inline: true });
    	const loderup = new Loderup({ $$inline: true });
    	const norrarorom = new Norrarorom({ $$inline: true });
    	const osssjo = new Osssjo({ $$inline: true });
    	const kingmarker = new Easteregg({ $$inline: true });
    	const bonemarker = new Easteregg({ $$inline: true });
    	const bjuvcity = new Bjuv_city({ $$inline: true });
    	const baracity = new Bara_city({ $$inline: true });
    	const brobycity = new Broby_city({ $$inline: true });
    	const loderupcity = new Loderup_city({ $$inline: true });
    	const norraroromcity = new Norrarorom_city({ $$inline: true });
    	const osssjocity = new Osssjo_city({ $$inline: true });
    	const easteregg = new Easteregg_modal({ $$inline: true });

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t0 = text("Startsida");
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			t2 = text("Skåne");
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			t4 = text("Blekinge");
    			t5 = space();
    			li3 = element("li");
    			a3 = element("a");
    			t6 = text("Kalmar");
    			t7 = space();
    			li4 = element("li");
    			a4 = element("a");
    			t8 = text("Stockholm");
    			t9 = space();
    			div11 = element("div");
    			div5 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Skåne föör faaaan!!";
    			t11 = space();
    			div4 = element("div");
    			p0 = element("p");
    			p0.textContent = "Det regnar, men vädret är fin fint, jag klagade inte\"";
    			t13 = space();
    			create_component(changebutton0.$$.fragment);
    			t14 = space();
    			create_component(changebutton1.$$.fragment);
    			t15 = space();
    			create_component(changebutton2.$$.fragment);
    			t16 = space();
    			create_component(changebutton3.$$.fragment);
    			t17 = space();
    			create_component(changebutton4.$$.fragment);
    			t18 = space();
    			create_component(changebutton5.$$.fragment);
    			t19 = space();
    			div6 = element("div");
    			img0 = element("img");
    			t20 = space();
    			create_component(bara.$$.fragment);
    			t21 = space();
    			create_component(bjuv.$$.fragment);
    			t22 = space();
    			create_component(broby.$$.fragment);
    			t23 = space();
    			create_component(loderup.$$.fragment);
    			t24 = space();
    			create_component(norrarorom.$$.fragment);
    			t25 = space();
    			create_component(osssjo.$$.fragment);
    			t26 = space();
    			create_component(kingmarker.$$.fragment);
    			t27 = space();
    			create_component(bonemarker.$$.fragment);
    			t28 = space();
    			div10 = element("div");
    			div7 = element("div");
    			img1 = element("img");
    			t29 = space();
    			canvas = element("canvas");
    			t30 = space();
    			div9 = element("div");
    			div8 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Vackra Skåne";
    			t32 = space();
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do\r\n          eiusmod tempor incididunt.";
    			t34 = space();
    			create_component(bjuvcity.$$.fragment);
    			t35 = space();
    			create_component(baracity.$$.fragment);
    			t36 = space();
    			create_component(brobycity.$$.fragment);
    			t37 = space();
    			create_component(loderupcity.$$.fragment);
    			t38 = space();
    			create_component(norraroromcity.$$.fragment);
    			t39 = space();
    			create_component(osssjocity.$$.fragment);
    			t40 = space();
    			create_component(easteregg.$$.fragment);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[0]("/"));
    			attr_dev(a0, "class", "svelte-35bq4m");
    			add_location(a0, file$r, 86, 8, 2270);
    			attr_dev(li0, "class", "uk-parent svelte-35bq4m");
    			add_location(li0, file$r, 85, 6, 2238);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[0]("/skane"));
    			attr_dev(a1, "class", "svelte-35bq4m");
    			add_location(a1, file$r, 89, 8, 2356);
    			attr_dev(li1, "class", "uk-parent svelte-35bq4m");
    			add_location(li1, file$r, 88, 6, 2324);
    			attr_dev(a2, "href", a2_href_value = /*$url*/ ctx[0]("/blekinge"));
    			attr_dev(a2, "class", "svelte-35bq4m");
    			add_location(a2, file$r, 92, 8, 2443);
    			attr_dev(li2, "class", "uk-parent svelte-35bq4m");
    			add_location(li2, file$r, 91, 6, 2411);
    			attr_dev(a3, "href", a3_href_value = /*$url*/ ctx[0]("/kalmar"));
    			attr_dev(a3, "class", "svelte-35bq4m");
    			add_location(a3, file$r, 95, 8, 2536);
    			attr_dev(li3, "class", "uk-parent svelte-35bq4m");
    			add_location(li3, file$r, 94, 6, 2504);
    			attr_dev(a4, "href", a4_href_value = /*$url*/ ctx[0]("/stockholm"));
    			attr_dev(a4, "class", "svelte-35bq4m");
    			add_location(a4, file$r, 98, 8, 2625);
    			attr_dev(li4, "class", "uk-parent svelte-35bq4m");
    			add_location(li4, file$r, 97, 6, 2593);
    			attr_dev(ul, "class", "uk-navbar-nav");
    			add_location(ul, file$r, 84, 4, 2204);
    			attr_dev(div0, "class", "uk-navbar-center svelte-35bq4m");
    			add_location(div0, file$r, 83, 2, 2168);
    			attr_dev(nav, "class", "uk-navbar-container svelte-35bq4m");
    			attr_dev(nav, "uk-nav", "");
    			add_location(nav, file$r, 82, 0, 2124);
    			attr_dev(h30, "class", "uk-card-title uk-margin-remove-bottom");
    			add_location(h30, file$r, 110, 10, 2973);
    			attr_dev(div1, "class", "uk-width-expand");
    			add_location(div1, file$r, 109, 8, 2932);
    			attr_dev(div2, "class", "uk-grid-small uk-flex-middle");
    			attr_dev(div2, "uk-grid", "");
    			add_location(div2, file$r, 108, 6, 2872);
    			attr_dev(div3, "class", "uk-card-header");
    			add_location(div3, file$r, 107, 4, 2836);
    			add_location(p0, file$r, 117, 6, 3155);
    			attr_dev(div4, "class", "uk-card-body");
    			add_location(div4, file$r, 116, 4, 3121);
    			attr_dev(div5, "class", "uk-card skane-title uk-card-default uk-child-width-1 uk-grid-match svelte-35bq4m");
    			add_location(div5, file$r, 105, 2, 2745);
    			attr_dev(img0, "class", "skane-img");
    			attr_dev(img0, "data-src", "../../images/skane.svg");
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "uk-svg", "");
    			add_location(img0, file$r, 132, 4, 3745);
    			attr_dev(div6, "class", "skane-map svelte-35bq4m");
    			add_location(div6, file$r, 131, 2, 3716);
    			if (img1.src !== (img1_src_value = "../../images/skaneland.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "uk-cover", "");
    			add_location(img1, file$r, 145, 6, 4130);
    			attr_dev(canvas, "width", "600");
    			attr_dev(canvas, "height", "400");
    			add_location(canvas, file$r, 146, 6, 4194);
    			attr_dev(div7, "class", "uk-card-media-left uk-cover-container");
    			add_location(div7, file$r, 144, 4, 4071);
    			attr_dev(h31, "class", "uk-card-title");
    			add_location(h31, file$r, 150, 8, 4296);
    			add_location(p1, file$r, 151, 8, 4349);
    			attr_dev(div8, "class", "uk-card-body");
    			add_location(div8, file$r, 149, 6, 4260);
    			add_location(div9, file$r, 148, 4, 4247);
    			attr_dev(div10, "class", "uk-card uk-card-default uk-grid-collapse  svelte-35bq4m");
    			attr_dev(div10, "uk-grid", "");
    			add_location(div10, file$r, 143, 2, 4002);
    			attr_dev(div11, "class", "flex-container svelte-35bq4m");
    			add_location(div11, file$r, 104, 0, 2713);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, t0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(a2, t4);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(a3, t6);
    			append_dev(ul, t7);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(a4, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div5);
    			append_dev(div5, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h30);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, p0);
    			append_dev(div4, t13);
    			mount_component(changebutton0, div4, null);
    			append_dev(div4, t14);
    			mount_component(changebutton1, div4, null);
    			append_dev(div4, t15);
    			mount_component(changebutton2, div4, null);
    			append_dev(div4, t16);
    			mount_component(changebutton3, div4, null);
    			append_dev(div4, t17);
    			mount_component(changebutton4, div4, null);
    			append_dev(div4, t18);
    			mount_component(changebutton5, div4, null);
    			append_dev(div11, t19);
    			append_dev(div11, div6);
    			append_dev(div6, img0);
    			append_dev(div6, t20);
    			mount_component(bara, div6, null);
    			append_dev(div6, t21);
    			mount_component(bjuv, div6, null);
    			append_dev(div6, t22);
    			mount_component(broby, div6, null);
    			append_dev(div6, t23);
    			mount_component(loderup, div6, null);
    			append_dev(div6, t24);
    			mount_component(norrarorom, div6, null);
    			append_dev(div6, t25);
    			mount_component(osssjo, div6, null);
    			append_dev(div6, t26);
    			mount_component(kingmarker, div6, null);
    			append_dev(div6, t27);
    			mount_component(bonemarker, div6, null);
    			append_dev(div11, t28);
    			append_dev(div11, div10);
    			append_dev(div10, div7);
    			append_dev(div7, img1);
    			append_dev(div7, t29);
    			append_dev(div7, canvas);
    			append_dev(div10, t30);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h31);
    			append_dev(div8, t32);
    			append_dev(div8, p1);
    			insert_dev(target, t34, anchor);
    			mount_component(bjuvcity, target, anchor);
    			insert_dev(target, t35, anchor);
    			mount_component(baracity, target, anchor);
    			insert_dev(target, t36, anchor);
    			mount_component(brobycity, target, anchor);
    			insert_dev(target, t37, anchor);
    			mount_component(loderupcity, target, anchor);
    			insert_dev(target, t38, anchor);
    			mount_component(norraroromcity, target, anchor);
    			insert_dev(target, t39, anchor);
    			mount_component(osssjocity, target, anchor);
    			insert_dev(target, t40, anchor);
    			mount_component(easteregg, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$url*/ 1 && a0_href_value !== (a0_href_value = /*$url*/ ctx[0]("/"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a1_href_value !== (a1_href_value = /*$url*/ ctx[0]("/skane"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a2_href_value !== (a2_href_value = /*$url*/ ctx[0]("/blekinge"))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a3_href_value !== (a3_href_value = /*$url*/ ctx[0]("/kalmar"))) {
    				attr_dev(a3, "href", a3_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a4_href_value !== (a4_href_value = /*$url*/ ctx[0]("/stockholm"))) {
    				attr_dev(a4, "href", a4_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(changebutton0.$$.fragment, local);
    			transition_in(changebutton1.$$.fragment, local);
    			transition_in(changebutton2.$$.fragment, local);
    			transition_in(changebutton3.$$.fragment, local);
    			transition_in(changebutton4.$$.fragment, local);
    			transition_in(changebutton5.$$.fragment, local);
    			transition_in(bara.$$.fragment, local);
    			transition_in(bjuv.$$.fragment, local);
    			transition_in(broby.$$.fragment, local);
    			transition_in(loderup.$$.fragment, local);
    			transition_in(norrarorom.$$.fragment, local);
    			transition_in(osssjo.$$.fragment, local);
    			transition_in(kingmarker.$$.fragment, local);
    			transition_in(bonemarker.$$.fragment, local);
    			transition_in(bjuvcity.$$.fragment, local);
    			transition_in(baracity.$$.fragment, local);
    			transition_in(brobycity.$$.fragment, local);
    			transition_in(loderupcity.$$.fragment, local);
    			transition_in(norraroromcity.$$.fragment, local);
    			transition_in(osssjocity.$$.fragment, local);
    			transition_in(easteregg.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(changebutton0.$$.fragment, local);
    			transition_out(changebutton1.$$.fragment, local);
    			transition_out(changebutton2.$$.fragment, local);
    			transition_out(changebutton3.$$.fragment, local);
    			transition_out(changebutton4.$$.fragment, local);
    			transition_out(changebutton5.$$.fragment, local);
    			transition_out(bara.$$.fragment, local);
    			transition_out(bjuv.$$.fragment, local);
    			transition_out(broby.$$.fragment, local);
    			transition_out(loderup.$$.fragment, local);
    			transition_out(norrarorom.$$.fragment, local);
    			transition_out(osssjo.$$.fragment, local);
    			transition_out(kingmarker.$$.fragment, local);
    			transition_out(bonemarker.$$.fragment, local);
    			transition_out(bjuvcity.$$.fragment, local);
    			transition_out(baracity.$$.fragment, local);
    			transition_out(brobycity.$$.fragment, local);
    			transition_out(loderupcity.$$.fragment, local);
    			transition_out(norraroromcity.$$.fragment, local);
    			transition_out(osssjocity.$$.fragment, local);
    			transition_out(easteregg.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div11);
    			destroy_component(changebutton0);
    			destroy_component(changebutton1);
    			destroy_component(changebutton2);
    			destroy_component(changebutton3);
    			destroy_component(changebutton4);
    			destroy_component(changebutton5);
    			destroy_component(bara);
    			destroy_component(bjuv);
    			destroy_component(broby);
    			destroy_component(loderup);
    			destroy_component(norrarorom);
    			destroy_component(osssjo);
    			destroy_component(kingmarker);
    			destroy_component(bonemarker);
    			if (detaching) detach_dev(t34);
    			destroy_component(bjuvcity, detaching);
    			if (detaching) detach_dev(t35);
    			destroy_component(baracity, detaching);
    			if (detaching) detach_dev(t36);
    			destroy_component(brobycity, detaching);
    			if (detaching) detach_dev(t37);
    			destroy_component(loderupcity, detaching);
    			if (detaching) detach_dev(t38);
    			destroy_component(norraroromcity, detaching);
    			if (detaching) detach_dev(t39);
    			destroy_component(osssjocity, detaching);
    			if (detaching) detach_dev(t40);
    			destroy_component(easteregg, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$E.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$E($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Skane> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Skane", $$slots, []);

    	$$self.$capture_state = () => ({
    		url,
    		Bara,
    		Bjuv,
    		Broby,
    		Loderup,
    		Norrarorom,
    		Osssjo,
    		KingMarker: Easteregg,
    		BoneMarker: Easteregg,
    		BjuvCity: Bjuv_city,
    		BaraCity: Bara_city,
    		BrobyCity: Broby_city,
    		LoderupCity: Loderup_city,
    		NorraRoromCity: Norrarorom_city,
    		OsssjoCity: Osssjo_city,
    		EasterEgg: Easteregg_modal,
    		Changebutton,
    		$url
    	});

    	return [$url];
    }

    class Skane extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$E, create_fragment$E, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skane",
    			options,
    			id: create_fragment$E.name
    		});
    	}
    }

    /* src\pages\stockholm-cities\lanna-city.svelte generated by Svelte v3.21.0 */

    // (9:2) <Audioplayer      id="lanna-yw"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/lanna/youngwoman.mp3">
    function create_default_slot_7$b(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Lanna",
    				agetitle: "Ung",
    				gender: "kvinna",
    				city: "Lanna"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$b.name,
    		type: "slot",
    		source: "(9:2) <Audioplayer      id=\\\"lanna-yw\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/lanna/youngwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Modal modalid="modal-youngwoman-lanna" modaltitle="Skåne">
    function create_default_slot_6$b(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "lanna-yw",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/lanna/youngwoman.mp3",
    				$$slots: { default: [create_default_slot_7$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$b.name,
    		type: "slot",
    		source: "(8:0) <Modal modalid=\\\"modal-youngwoman-lanna\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Audioplayer      id="lanna-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/lanna/oldwoman.mp3">
    function create_default_slot_5$b(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Lanna",
    				agetitle: "Äldre",
    				gender: "kvinna",
    				city: "Lanna"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$b.name,
    		type: "slot",
    		source: "(17:2) <Audioplayer      id=\\\"lanna-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/lanna/oldwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Modal modalid="modal-oldwoman-lanna" modaltitle="Skåne">
    function create_default_slot_4$b(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "lanna-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/lanna/oldwoman.mp3",
    				$$slots: { default: [create_default_slot_5$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$b.name,
    		type: "slot",
    		source: "(16:0) <Modal modalid=\\\"modal-oldwoman-lanna\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:2) <Audioplayer      id="lanna-ow"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/lanna/youngman.mp3">
    function create_default_slot_3$c(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Lanna",
    				agetitle: "Ung",
    				gender: "man",
    				city: "Lanna"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$c.name,
    		type: "slot",
    		source: "(25:2) <Audioplayer      id=\\\"lanna-ow\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/lanna/youngman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:0) <Modal modalid="modal-youngman-lanna" modaltitle="Skåne">
    function create_default_slot_2$c(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "lanna-ow",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/lanna/youngman.mp3",
    				$$slots: { default: [create_default_slot_3$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$c.name,
    		type: "slot",
    		source: "(24:0) <Modal modalid=\\\"modal-youngman-lanna\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Audioplayer      id="lanna-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/lanna/oldman.mp3">
    function create_default_slot_1$c(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Lanna",
    				agetitle: "Äldre",
    				gender: "man",
    				city: "Lanna"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$c.name,
    		type: "slot",
    		source: "(33:2) <Audioplayer      id=\\\"lanna-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/lanna/oldman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Modal modalid="modal-oldman-lanna" modaltitle="Skåne">
    function create_default_slot$d(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "lanna-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/lanna/oldman.mp3",
    				$$slots: { default: [create_default_slot_1$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$d.name,
    		type: "slot",
    		source: "(32:0) <Modal modalid=\\\"modal-oldman-lanna\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$F(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-youngwoman-lanna",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_6$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-oldwoman-lanna",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_4$b] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal2 = new Modal({
    			props: {
    				modalid: "modal-youngman-lanna",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal3 = new Modal({
    			props: {
    				modalid: "modal-oldman-lanna",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			create_component(modal2.$$.fragment);
    			t2 = space();
    			create_component(modal3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			modal2.$set(modal2_changes);
    			const modal3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal3_changes.$$scope = { dirty, ctx };
    			}

    			modal3.$set(modal3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			transition_in(modal3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			transition_out(modal3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$F.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$F($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lanna_city> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Lanna_city", $$slots, []);

    	$$self.$capture_state = () => ({
    		Audioplayer,
    		Cardinfo,
    		Modal,
    		LannaMarker: Lanna
    	});

    	return [];
    }

    class Lanna_city extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$F, create_fragment$F, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lanna_city",
    			options,
    			id: create_fragment$F.name
    		});
    	}
    }

    /* src\pages\stockholm-cities\sorunda-city.svelte generated by Svelte v3.21.0 */

    // (9:2) <Audioplayer      id="sorunda-yw"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/sorunda/youngwoman.mp3">
    function create_default_slot_7$c(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Sorunda",
    				agetitle: "Ung",
    				gender: "kvinna",
    				city: "Sorunda"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$c.name,
    		type: "slot",
    		source: "(9:2) <Audioplayer      id=\\\"sorunda-yw\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/sorunda/youngwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Modal modalid="modal-youngwoman-sorunda" modaltitle="Skåne">
    function create_default_slot_6$c(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "sorunda-yw",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/sorunda/youngwoman.mp3",
    				$$slots: { default: [create_default_slot_7$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$c.name,
    		type: "slot",
    		source: "(8:0) <Modal modalid=\\\"modal-youngwoman-sorunda\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Audioplayer      id="sorunda-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/sorunda/oldwoman.mp3">
    function create_default_slot_5$c(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Sorunda",
    				agetitle: "Äldre",
    				gender: "kvinna",
    				city: "Sorunda"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$c.name,
    		type: "slot",
    		source: "(17:2) <Audioplayer      id=\\\"sorunda-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/sorunda/oldwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (16:0) <Modal modalid="modal-oldwoman-sorunda" modaltitle="Skåne">
    function create_default_slot_4$c(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "sorunda-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/sorunda/oldwoman.mp3",
    				$$slots: { default: [create_default_slot_5$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$c.name,
    		type: "slot",
    		source: "(16:0) <Modal modalid=\\\"modal-oldwoman-sorunda\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:2) <Audioplayer      id="sorunda-ow"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/sorunda/youngman.mp3">
    function create_default_slot_3$d(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Sorunda",
    				agetitle: "Ung",
    				gender: "man",
    				city: "Sorunda"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$d.name,
    		type: "slot",
    		source: "(25:2) <Audioplayer      id=\\\"sorunda-ow\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/sorunda/youngman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:0) <Modal modalid="modal-youngman-sorunda" modaltitle="Skåne">
    function create_default_slot_2$d(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "sorunda-ow",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/sorunda/youngman.mp3",
    				$$slots: { default: [create_default_slot_3$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$d.name,
    		type: "slot",
    		source: "(24:0) <Modal modalid=\\\"modal-youngman-sorunda\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Audioplayer      id="sorunda-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/sorunda/oldman.mp3">
    function create_default_slot_1$d(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Sorunda",
    				agetitle: "Äldre",
    				gender: "man",
    				city: "Sorunda"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$d.name,
    		type: "slot",
    		source: "(33:2) <Audioplayer      id=\\\"sorunda-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/sorunda/oldman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Modal modalid="modal-oldman-sorunda" modaltitle="Skåne">
    function create_default_slot$e(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "sorunda-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/sorunda/oldman.mp3",
    				$$slots: { default: [create_default_slot_1$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$e.name,
    		type: "slot",
    		source: "(32:0) <Modal modalid=\\\"modal-oldman-sorunda\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$G(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-youngwoman-sorunda",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_6$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-oldwoman-sorunda",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_4$c] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal2 = new Modal({
    			props: {
    				modalid: "modal-youngman-sorunda",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal3 = new Modal({
    			props: {
    				modalid: "modal-oldman-sorunda",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot$e] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			create_component(modal2.$$.fragment);
    			t2 = space();
    			create_component(modal3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			modal2.$set(modal2_changes);
    			const modal3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal3_changes.$$scope = { dirty, ctx };
    			}

    			modal3.$set(modal3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			transition_in(modal3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			transition_out(modal3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$G.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$G($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sorunda_city> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Sorunda_city", $$slots, []);

    	$$self.$capture_state = () => ({
    		Audioplayer,
    		Cardinfo,
    		Modal,
    		SorundaMarker: Sorunda
    	});

    	return [];
    }

    class Sorunda_city extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$G, create_fragment$G, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sorunda_city",
    			options,
    			id: create_fragment$G.name
    		});
    	}
    }

    /* src\pages\stockholm-cities\vingaker-city.svelte generated by Svelte v3.21.0 */

    // (9:2) <Audioplayer      id="vingaker-yw"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/vingaker/youngwoman.mp3">
    function create_default_slot_7$d(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Västra Vingåker",
    				agetitle: "Ung",
    				gender: "kvinna",
    				city: "Västra Vingåker"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$d.name,
    		type: "slot",
    		source: "(9:2) <Audioplayer      id=\\\"vingaker-yw\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/vingaker/youngwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:0) <Modal modalid="modal-youngwoman-vingaker" modaltitle="Skåne">
    function create_default_slot_6$d(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "vingaker-yw",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/vingaker/youngwoman.mp3",
    				$$slots: { default: [create_default_slot_7$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$d.name,
    		type: "slot",
    		source: "(8:0) <Modal modalid=\\\"modal-youngwoman-vingaker\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:2) <Audioplayer      id="vingaker-ym"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/vingaker/oldwoman.mp3">
    function create_default_slot_5$d(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Västra Vingåker",
    				agetitle: "Äldre",
    				gender: "kvinna",
    				city: "Västra Vingåker"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$d.name,
    		type: "slot",
    		source: "(21:2) <Audioplayer      id=\\\"vingaker-ym\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/vingaker/oldwoman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:0) <Modal modalid="modal-oldwoman-vingaker" modaltitle="Skåne">
    function create_default_slot_4$d(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "vingaker-ym",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/vingaker/oldwoman.mp3",
    				$$slots: { default: [create_default_slot_5$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$d.name,
    		type: "slot",
    		source: "(20:0) <Modal modalid=\\\"modal-oldwoman-vingaker\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:2) <Audioplayer      id="vingaker-ow"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/vingaker/youngman.mp3">
    function create_default_slot_3$e(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Västra Vingåker",
    				agetitle: "Ung",
    				gender: "Man",
    				city: "Västra Vingåker"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$e.name,
    		type: "slot",
    		source: "(33:2) <Audioplayer      id=\\\"vingaker-ow\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/vingaker/youngman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:0) <Modal modalid="modal-youngman-vingaker" modaltitle="Skåne">
    function create_default_slot_2$e(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "vingaker-ow",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/vingaker/youngman.mp3",
    				$$slots: { default: [create_default_slot_3$e] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$e.name,
    		type: "slot",
    		source: "(32:0) <Modal modalid=\\\"modal-youngman-vingaker\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    // (45:2) <Audioplayer      id="vingaker-om"      src="https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/vingaker/oldman.mp3">
    function create_default_slot_1$e(ctx) {
    	let current;

    	const cardinfo = new Cardinfo({
    			props: {
    				title: "Västra Vingåker",
    				agetitle: "Äldre",
    				gender: "man",
    				city: "Västra Vingåker"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardinfo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardinfo, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardinfo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardinfo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardinfo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$e.name,
    		type: "slot",
    		source: "(45:2) <Audioplayer      id=\\\"vingaker-om\\\"      src=\\\"https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/vingaker/oldman.mp3\\\">",
    		ctx
    	});

    	return block;
    }

    // (44:0) <Modal modalid="modal-oldman-vingaker" modaltitle="Skåne">
    function create_default_slot$f(ctx) {
    	let current;

    	const audioplayer = new Audioplayer({
    			props: {
    				id: "vingaker-om",
    				src: "https://aaronkhah92.github.io/potayder-o-panntoffler/public/assets/counties/stockholm/vingaker/oldman.mp3",
    				$$slots: { default: [create_default_slot_1$e] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(audioplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(audioplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const audioplayer_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				audioplayer_changes.$$scope = { dirty, ctx };
    			}

    			audioplayer.$set(audioplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(audioplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(audioplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(audioplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$f.name,
    		type: "slot",
    		source: "(44:0) <Modal modalid=\\\"modal-oldman-vingaker\\\" modaltitle=\\\"Skåne\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$H(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const modal0 = new Modal({
    			props: {
    				modalid: "modal-youngwoman-vingaker",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_6$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal1 = new Modal({
    			props: {
    				modalid: "modal-oldwoman-vingaker",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_4$d] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal2 = new Modal({
    			props: {
    				modalid: "modal-youngman-vingaker",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot_2$e] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const modal3 = new Modal({
    			props: {
    				modalid: "modal-oldman-vingaker",
    				modaltitle: "Skåne",
    				$$slots: { default: [create_default_slot$f] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			create_component(modal2.$$.fragment);
    			t2 = space();
    			create_component(modal3.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(modal2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(modal3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			modal2.$set(modal2_changes);
    			const modal3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal3_changes.$$scope = { dirty, ctx };
    			}

    			modal3.$set(modal3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			transition_in(modal3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			transition_out(modal3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(modal2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$H.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$H($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Vingaker_city> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Vingaker_city", $$slots, []);

    	$$self.$capture_state = () => ({
    		Audioplayer,
    		Cardinfo,
    		Modal,
    		VingakerMarker: Vvingaker
    	});

    	return [];
    }

    class Vingaker_city extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$H, create_fragment$H, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vingaker_city",
    			options,
    			id: create_fragment$H.name
    		});
    	}
    }

    /* src\pages\stockholm.svelte generated by Svelte v3.21.0 */
    const file$s = "src\\pages\\stockholm.svelte";

    function create_fragment$I(ctx) {
    	let nav;
    	let div0;
    	let ul;
    	let li0;
    	let a0;
    	let t0;
    	let a0_href_value;
    	let t1;
    	let li1;
    	let a1;
    	let t2;
    	let a1_href_value;
    	let t3;
    	let li2;
    	let a2;
    	let t4;
    	let a2_href_value;
    	let t5;
    	let li3;
    	let a3;
    	let t6;
    	let a3_href_value;
    	let t7;
    	let li4;
    	let a4;
    	let t8;
    	let a4_href_value;
    	let t9;
    	let div11;
    	let div5;
    	let div3;
    	let div2;
    	let div1;
    	let h30;
    	let t11;
    	let div4;
    	let p0;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let div6;
    	let img0;
    	let t17;
    	let t18;
    	let t19;
    	let t20;
    	let div10;
    	let div7;
    	let img1;
    	let img1_src_value;
    	let t21;
    	let canvas;
    	let t22;
    	let div9;
    	let div8;
    	let h31;
    	let t24;
    	let p1;
    	let t26;
    	let t27;
    	let t28;
    	let current;

    	const changebutton0 = new Changebutton({
    			props: {
    				targetCityName: "Lanna",
    				targetCityId: "#old-lanna"
    			},
    			$$inline: true
    		});

    	const changebutton1 = new Changebutton({
    			props: {
    				targetCityName: "Sorunda",
    				targetCityId: "#old-sorunda"
    			},
    			$$inline: true
    		});

    	const changebutton2 = new Changebutton({
    			props: {
    				targetCityName: "Västra Vingåker",
    				targetCityId: "#old-vingaker"
    			},
    			$$inline: true
    		});

    	const lanna = new Lanna({ $$inline: true });
    	const sorunda = new Sorunda({ $$inline: true });
    	const vingaker = new Vvingaker({ $$inline: true });
    	const lannacity = new Lanna_city({ $$inline: true });
    	const sorundacity = new Sorunda_city({ $$inline: true });
    	const vingakercity = new Vingaker_city({ $$inline: true });

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t0 = text("Startsida");
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			t2 = text("Skåne");
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			t4 = text("Blekinge");
    			t5 = space();
    			li3 = element("li");
    			a3 = element("a");
    			t6 = text("Kalmar");
    			t7 = space();
    			li4 = element("li");
    			a4 = element("a");
    			t8 = text("Stockholm");
    			t9 = space();
    			div11 = element("div");
    			div5 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Stockholm, där en falafel kostar 100kr";
    			t11 = space();
    			div4 = element("div");
    			p0 = element("p");
    			p0.textContent = "Stockholm är mitt Hjääartaa";
    			t13 = space();
    			create_component(changebutton0.$$.fragment);
    			t14 = space();
    			create_component(changebutton1.$$.fragment);
    			t15 = space();
    			create_component(changebutton2.$$.fragment);
    			t16 = space();
    			div6 = element("div");
    			img0 = element("img");
    			t17 = space();
    			create_component(lanna.$$.fragment);
    			t18 = space();
    			create_component(sorunda.$$.fragment);
    			t19 = space();
    			create_component(vingaker.$$.fragment);
    			t20 = space();
    			div10 = element("div");
    			div7 = element("div");
    			img1 = element("img");
    			t21 = space();
    			canvas = element("canvas");
    			t22 = space();
    			div9 = element("div");
    			div8 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Stockholm";
    			t24 = space();
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do\r\n          eiusmod tempor incididunt.";
    			t26 = space();
    			create_component(lannacity.$$.fragment);
    			t27 = space();
    			create_component(sorundacity.$$.fragment);
    			t28 = space();
    			create_component(vingakercity.$$.fragment);
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[0]("/"));
    			attr_dev(a0, "class", "svelte-1qvnqpl");
    			add_location(a0, file$s, 67, 8, 1604);
    			attr_dev(li0, "class", "uk-parent svelte-1qvnqpl");
    			add_location(li0, file$s, 66, 6, 1572);
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[0]("/skane"));
    			attr_dev(a1, "class", "svelte-1qvnqpl");
    			add_location(a1, file$s, 70, 8, 1690);
    			attr_dev(li1, "class", "uk-parent svelte-1qvnqpl");
    			add_location(li1, file$s, 69, 6, 1658);
    			attr_dev(a2, "href", a2_href_value = /*$url*/ ctx[0]("/blekinge"));
    			attr_dev(a2, "class", "svelte-1qvnqpl");
    			add_location(a2, file$s, 73, 8, 1777);
    			attr_dev(li2, "class", "uk-parent svelte-1qvnqpl");
    			add_location(li2, file$s, 72, 6, 1745);
    			attr_dev(a3, "href", a3_href_value = /*$url*/ ctx[0]("/kalmar"));
    			attr_dev(a3, "class", "svelte-1qvnqpl");
    			add_location(a3, file$s, 76, 8, 1870);
    			attr_dev(li3, "class", "uk-parent svelte-1qvnqpl");
    			add_location(li3, file$s, 75, 6, 1838);
    			attr_dev(a4, "href", a4_href_value = /*$url*/ ctx[0]("/stockholm"));
    			attr_dev(a4, "class", "svelte-1qvnqpl");
    			add_location(a4, file$s, 79, 8, 1959);
    			attr_dev(li4, "class", "uk-parent svelte-1qvnqpl");
    			add_location(li4, file$s, 78, 6, 1927);
    			attr_dev(ul, "class", "uk-navbar-nav");
    			add_location(ul, file$s, 65, 4, 1538);
    			attr_dev(div0, "class", "uk-navbar-center svelte-1qvnqpl");
    			add_location(div0, file$s, 64, 2, 1502);
    			attr_dev(nav, "class", "uk-navbar-container svelte-1qvnqpl");
    			attr_dev(nav, "uk-nav", "");
    			add_location(nav, file$s, 63, 0, 1458);
    			attr_dev(h30, "class", "uk-card-title uk-margin-remove-bottom");
    			add_location(h30, file$s, 91, 10, 2292);
    			attr_dev(div1, "class", "uk-width-expand");
    			add_location(div1, file$s, 90, 8, 2251);
    			attr_dev(div2, "class", "uk-grid-small uk-flex-middle");
    			attr_dev(div2, "uk-grid", "");
    			add_location(div2, file$s, 89, 6, 2191);
    			attr_dev(div3, "class", "uk-card-header");
    			add_location(div3, file$s, 88, 4, 2155);
    			add_location(p0, file$s, 98, 6, 2493);
    			attr_dev(div4, "class", "uk-card-body");
    			add_location(div4, file$s, 97, 4, 2459);
    			attr_dev(div5, "class", "uk-card uk-card-default uk-child-width-1 uk-grid-match svelte-1qvnqpl");
    			add_location(div5, file$s, 87, 2, 2081);
    			attr_dev(img0, "class", "stockholm-img");
    			attr_dev(img0, "data-src", "../../images/stockholm.svg");
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "uk-svg", "");
    			add_location(img0, file$s, 109, 4, 2844);
    			attr_dev(div6, "class", "stockholm-map svelte-1qvnqpl");
    			add_location(div6, file$s, 108, 2, 2811);
    			if (img1.src !== (img1_src_value = "./../images/stockholm.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "uk-cover", "");
    			add_location(img1, file$s, 121, 6, 3147);
    			attr_dev(canvas, "width", "600");
    			attr_dev(canvas, "height", "400");
    			add_location(canvas, file$s, 122, 6, 3210);
    			attr_dev(div7, "class", "uk-card-media-left uk-cover-container");
    			add_location(div7, file$s, 120, 4, 3088);
    			attr_dev(h31, "class", "uk-card-title");
    			add_location(h31, file$s, 126, 8, 3329);
    			add_location(p1, file$s, 127, 8, 3379);
    			attr_dev(div8, "id", "mediaplayer");
    			attr_dev(div8, "class", "uk-card-body");
    			add_location(div8, file$s, 125, 6, 3276);
    			add_location(div9, file$s, 124, 4, 3263);
    			attr_dev(div10, "class", "uk-card uk-card-default uk-grid-collapse  svelte-1qvnqpl");
    			attr_dev(div10, "uk-grid", "");
    			add_location(div10, file$s, 119, 2, 3019);
    			attr_dev(div11, "class", "flex-container svelte-1qvnqpl");
    			add_location(div11, file$s, 85, 0, 2047);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, t0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(a2, t4);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(a3, t6);
    			append_dev(ul, t7);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(a4, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div5);
    			append_dev(div5, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h30);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, p0);
    			append_dev(div4, t13);
    			mount_component(changebutton0, div4, null);
    			append_dev(div4, t14);
    			mount_component(changebutton1, div4, null);
    			append_dev(div4, t15);
    			mount_component(changebutton2, div4, null);
    			append_dev(div11, t16);
    			append_dev(div11, div6);
    			append_dev(div6, img0);
    			append_dev(div6, t17);
    			mount_component(lanna, div6, null);
    			append_dev(div6, t18);
    			mount_component(sorunda, div6, null);
    			append_dev(div6, t19);
    			mount_component(vingaker, div6, null);
    			append_dev(div11, t20);
    			append_dev(div11, div10);
    			append_dev(div10, div7);
    			append_dev(div7, img1);
    			append_dev(div7, t21);
    			append_dev(div7, canvas);
    			append_dev(div10, t22);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h31);
    			append_dev(div8, t24);
    			append_dev(div8, p1);
    			insert_dev(target, t26, anchor);
    			mount_component(lannacity, target, anchor);
    			insert_dev(target, t27, anchor);
    			mount_component(sorundacity, target, anchor);
    			insert_dev(target, t28, anchor);
    			mount_component(vingakercity, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$url*/ 1 && a0_href_value !== (a0_href_value = /*$url*/ ctx[0]("/"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a1_href_value !== (a1_href_value = /*$url*/ ctx[0]("/skane"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a2_href_value !== (a2_href_value = /*$url*/ ctx[0]("/blekinge"))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a3_href_value !== (a3_href_value = /*$url*/ ctx[0]("/kalmar"))) {
    				attr_dev(a3, "href", a3_href_value);
    			}

    			if (!current || dirty & /*$url*/ 1 && a4_href_value !== (a4_href_value = /*$url*/ ctx[0]("/stockholm"))) {
    				attr_dev(a4, "href", a4_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(changebutton0.$$.fragment, local);
    			transition_in(changebutton1.$$.fragment, local);
    			transition_in(changebutton2.$$.fragment, local);
    			transition_in(lanna.$$.fragment, local);
    			transition_in(sorunda.$$.fragment, local);
    			transition_in(vingaker.$$.fragment, local);
    			transition_in(lannacity.$$.fragment, local);
    			transition_in(sorundacity.$$.fragment, local);
    			transition_in(vingakercity.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(changebutton0.$$.fragment, local);
    			transition_out(changebutton1.$$.fragment, local);
    			transition_out(changebutton2.$$.fragment, local);
    			transition_out(lanna.$$.fragment, local);
    			transition_out(sorunda.$$.fragment, local);
    			transition_out(vingaker.$$.fragment, local);
    			transition_out(lannacity.$$.fragment, local);
    			transition_out(sorundacity.$$.fragment, local);
    			transition_out(vingakercity.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div11);
    			destroy_component(changebutton0);
    			destroy_component(changebutton1);
    			destroy_component(changebutton2);
    			destroy_component(lanna);
    			destroy_component(sorunda);
    			destroy_component(vingaker);
    			if (detaching) detach_dev(t26);
    			destroy_component(lannacity, detaching);
    			if (detaching) detach_dev(t27);
    			destroy_component(sorundacity, detaching);
    			if (detaching) detach_dev(t28);
    			destroy_component(vingakercity, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$I.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$I($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Stockholm> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Stockholm", $$slots, []);

    	$$self.$capture_state = () => ({
    		url,
    		Lanna,
    		Sorunda,
    		Vingaker: Vvingaker,
    		Audioplayer,
    		Changebutton,
    		LannaCity: Lanna_city,
    		SorundaCity: Sorunda_city,
    		VingakerCity: Vingaker_city,
    		$url
    	});

    	return [$url];
    }

    class Stockholm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$I, create_fragment$I, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stockholm",
    			options,
    			id: create_fragment$I.name
    		});
    	}
    }

    //raw routes
    const _routes = [
      {
        "component": () => Hallevik_city,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/blekinge-cities/hallevik-city",
        "shortPath": "/blekinge-cities/hallevik-city",
        "layouts": []
      },
      {
        "component": () => Jamshog_city,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/blekinge-cities/jamshog-city",
        "shortPath": "/blekinge-cities/jamshog-city",
        "layouts": []
      },
      {
        "component": () => Torhamn_city,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/blekinge-cities/torhamn-city",
        "shortPath": "/blekinge-cities/torhamn-city",
        "layouts": []
      },
      {
        "component": () => Blekinge,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/blekinge",
        "shortPath": "/blekinge",
        "layouts": []
      },
      {
        "component": () => Pages,
        "meta": {},
        "isIndex": true,
        "isFallback": false,
        "hasParam": false,
        "path": "/index",
        "shortPath": "",
        "layouts": []
      },
      {
        "component": () => Ankarsrum_city,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/kalmar-cities/ankarsrum-city",
        "shortPath": "/kalmar-cities/ankarsrum-city",
        "layouts": []
      },
      {
        "component": () => Torsas_city,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/kalmar-cities/torsas-city",
        "shortPath": "/kalmar-cities/torsas-city",
        "layouts": []
      },
      {
        "component": () => Kalmar,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/kalmar",
        "shortPath": "/kalmar",
        "layouts": []
      },
      {
        "component": () => Blekinge_marker,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/Blekinge-marker",
        "shortPath": "/markers/Blekinge-marker",
        "layouts": []
      },
      {
        "component": () => Hallevik,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/blekinge/Hallevik",
        "shortPath": "/markers/citiesin/blekinge/Hallevik",
        "layouts": []
      },
      {
        "component": () => Jamshog,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/blekinge/Jamshog",
        "shortPath": "/markers/citiesin/blekinge/Jamshog",
        "layouts": []
      },
      {
        "component": () => Torhamn,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/blekinge/Torhamn",
        "shortPath": "/markers/citiesin/blekinge/Torhamn",
        "layouts": []
      },
      {
        "component": () => Ankarsrum,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/kalmar/Ankarsrum",
        "shortPath": "/markers/citiesin/kalmar/Ankarsrum",
        "layouts": []
      },
      {
        "component": () => Torsas,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/kalmar/Torsas",
        "shortPath": "/markers/citiesin/kalmar/Torsas",
        "layouts": []
      },
      {
        "component": () => Bara,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/skane/Bara",
        "shortPath": "/markers/citiesin/skane/Bara",
        "layouts": []
      },
      {
        "component": () => Bjuv,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/skane/Bjuv",
        "shortPath": "/markers/citiesin/skane/Bjuv",
        "layouts": []
      },
      {
        "component": () => Broby,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/skane/Broby",
        "shortPath": "/markers/citiesin/skane/Broby",
        "layouts": []
      },
      {
        "component": () => Easteregg,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/skane/easteregg",
        "shortPath": "/markers/citiesin/skane/easteregg",
        "layouts": []
      },
      {
        "component": () => Loderup,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/skane/Loderup",
        "shortPath": "/markers/citiesin/skane/Loderup",
        "layouts": []
      },
      {
        "component": () => Norrarorom,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/skane/Norrarorom",
        "shortPath": "/markers/citiesin/skane/Norrarorom",
        "layouts": []
      },
      {
        "component": () => Osssjo,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/skane/Osssjo",
        "shortPath": "/markers/citiesin/skane/Osssjo",
        "layouts": []
      },
      {
        "component": () => Lanna,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/stockholm/Lanna",
        "shortPath": "/markers/citiesin/stockholm/Lanna",
        "layouts": []
      },
      {
        "component": () => Sorunda,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/stockholm/Sorunda",
        "shortPath": "/markers/citiesin/stockholm/Sorunda",
        "layouts": []
      },
      {
        "component": () => Vvingaker,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/citiesin/stockholm/Vvingaker",
        "shortPath": "/markers/citiesin/stockholm/Vvingaker",
        "layouts": []
      },
      {
        "component": () => Kalmar_marker,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/Kalmar-marker",
        "shortPath": "/markers/Kalmar-marker",
        "layouts": []
      },
      {
        "component": () => Skane_marker,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/Skane-marker",
        "shortPath": "/markers/Skane-marker",
        "layouts": []
      },
      {
        "component": () => Stockholm_marker,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/markers/Stockholm-marker",
        "shortPath": "/markers/Stockholm-marker",
        "layouts": []
      },
      {
        "component": () => Bara_city,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/skane-cities/bara-city",
        "shortPath": "/skane-cities/bara-city",
        "layouts": []
      },
      {
        "component": () => Bjuv_city,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/skane-cities/bjuv-city",
        "shortPath": "/skane-cities/bjuv-city",
        "layouts": []
      },
      {
        "component": () => Broby_city,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/skane-cities/broby-city",
        "shortPath": "/skane-cities/broby-city",
        "layouts": []
      },
      {
        "component": () => Easteregg_modal,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/skane-cities/easteregg-modal",
        "shortPath": "/skane-cities/easteregg-modal",
        "layouts": []
      },
      {
        "component": () => Loderup_city,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/skane-cities/loderup-city",
        "shortPath": "/skane-cities/loderup-city",
        "layouts": []
      },
      {
        "component": () => Norrarorom_city,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/skane-cities/norrarorom-city",
        "shortPath": "/skane-cities/norrarorom-city",
        "layouts": []
      },
      {
        "component": () => Osssjo_city,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/skane-cities/osssjo-city",
        "shortPath": "/skane-cities/osssjo-city",
        "layouts": []
      },
      {
        "component": () => Skane,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/skane",
        "shortPath": "/skane",
        "layouts": []
      },
      {
        "component": () => Lanna_city,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/stockholm-cities/lanna-city",
        "shortPath": "/stockholm-cities/lanna-city",
        "layouts": []
      },
      {
        "component": () => Sorunda_city,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/stockholm-cities/sorunda-city",
        "shortPath": "/stockholm-cities/sorunda-city",
        "layouts": []
      },
      {
        "component": () => Vingaker_city,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/stockholm-cities/vingaker-city",
        "shortPath": "/stockholm-cities/vingaker-city",
        "layouts": []
      },
      {
        "component": () => Stockholm,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/stockholm",
        "shortPath": "/stockholm",
        "layouts": []
      }
    ];

    //routes
    const routes$1 = buildRoutes(_routes);

    /* src\App.svelte generated by Svelte v3.21.0 */

    function create_fragment$J(ctx) {
    	let current;
    	const router = new Router({ props: { routes: routes$1 }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$J.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$J($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Router, routes: routes$1, url });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$J, create_fragment$J, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$J.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var uikit = createCommonjsModule(function (module, exports) {
    /*! UIkit 3.4.2 | https://www.getuikit.com | (c) 2014 - 2020 YOOtheme | MIT License */

    (function (global, factory) {
         module.exports = factory() ;
    }(commonjsGlobal, (function () {
        var objPrototype = Object.prototype;
        var hasOwnProperty = objPrototype.hasOwnProperty;

        function hasOwn(obj, key) {
            return hasOwnProperty.call(obj, key);
        }

        var hyphenateCache = {};
        var hyphenateRe = /([a-z\d])([A-Z])/g;

        function hyphenate(str) {

            if (!(str in hyphenateCache)) {
                hyphenateCache[str] = str
                    .replace(hyphenateRe, '$1-$2')
                    .toLowerCase();
            }

            return hyphenateCache[str];
        }

        var camelizeRe = /-(\w)/g;

        function camelize(str) {
            return str.replace(camelizeRe, toUpper);
        }

        function toUpper(_, c) {
            return c ? c.toUpperCase() : '';
        }

        function ucfirst(str) {
            return str.length ? toUpper(null, str.charAt(0)) + str.slice(1) : '';
        }

        var strPrototype = String.prototype;
        var startsWithFn = strPrototype.startsWith || function (search) { return this.lastIndexOf(search, 0) === 0; };

        function startsWith(str, search) {
            return startsWithFn.call(str, search);
        }

        var endsWithFn = strPrototype.endsWith || function (search) { return this.substr(-search.length) === search; };

        function endsWith(str, search) {
            return endsWithFn.call(str, search);
        }

        var arrPrototype = Array.prototype;

        var includesFn = function (search, i) { return !!~this.indexOf(search, i); };
        var includesStr = strPrototype.includes || includesFn;
        var includesArray = arrPrototype.includes || includesFn;

        function includes(obj, search) {
            return obj && (isString(obj) ? includesStr : includesArray).call(obj, search);
        }

        var findIndexFn = arrPrototype.findIndex || function (predicate) {
            var arguments$1 = arguments;

            for (var i = 0; i < this.length; i++) {
                if (predicate.call(arguments$1[1], this[i], i, this)) {
                    return i;
                }
            }
            return -1;
        };

        function findIndex(array, predicate) {
            return findIndexFn.call(array, predicate);
        }

        var isArray = Array.isArray;

        function isFunction(obj) {
            return typeof obj === 'function';
        }

        function isObject(obj) {
            return obj !== null && typeof obj === 'object';
        }

        var toString = objPrototype.toString;
        function isPlainObject(obj) {
            return toString.call(obj) === '[object Object]';
        }

        function isWindow(obj) {
            return isObject(obj) && obj === obj.window;
        }

        function isDocument(obj) {
            return isObject(obj) && obj.nodeType === 9;
        }

        function isJQuery(obj) {
            return isObject(obj) && !!obj.jquery;
        }

        function isNode(obj) {
            return isObject(obj) && obj.nodeType >= 1;
        }

        function isElement(obj) {
            return isObject(obj) && obj.nodeType === 1;
        }

        function isNodeCollection(obj) {
            return toString.call(obj).match(/^\[object (NodeList|HTMLCollection)\]$/);
        }

        function isBoolean(value) {
            return typeof value === 'boolean';
        }

        function isString(value) {
            return typeof value === 'string';
        }

        function isNumber(value) {
            return typeof value === 'number';
        }

        function isNumeric(value) {
            return isNumber(value) || isString(value) && !isNaN(value - parseFloat(value));
        }

        function isEmpty(obj) {
            return !(isArray(obj)
                ? obj.length
                : isObject(obj)
                    ? Object.keys(obj).length
                    : false
            );
        }

        function isUndefined(value) {
            return value === void 0;
        }

        function toBoolean(value) {
            return isBoolean(value)
                ? value
                : value === 'true' || value === '1' || value === ''
                    ? true
                    : value === 'false' || value === '0'
                        ? false
                        : value;
        }

        function toNumber(value) {
            var number = Number(value);
            return !isNaN(number) ? number : false;
        }

        function toFloat(value) {
            return parseFloat(value) || 0;
        }

        function toNode(element) {
            return isNode(element)
                ? element
                : isNodeCollection(element) || isJQuery(element)
                    ? element[0]
                    : isArray(element)
                        ? toNode(element[0])
                        : null;
        }

        function toNodes(element) {
            return isNode(element)
                ? [element]
                : isNodeCollection(element)
                    ? arrPrototype.slice.call(element)
                    : isArray(element)
                        ? element.map(toNode).filter(Boolean)
                        : isJQuery(element)
                            ? element.toArray()
                            : [];
        }

        function toWindow(element) {
            if (isWindow(element)) {
                return element;
            }

            element = toNode(element);

            return element
                ? (isDocument(element)
                    ? element
                    : element.ownerDocument
                ).defaultView
                : window;
        }

        function toList(value) {
            return isArray(value)
                ? value
                : isString(value)
                    ? value.split(/,(?![^(]*\))/).map(function (value) { return isNumeric(value)
                        ? toNumber(value)
                        : toBoolean(value.trim()); })
                    : [value];
        }

        function toMs(time) {
            return !time
                ? 0
                : endsWith(time, 'ms')
                    ? toFloat(time)
                    : toFloat(time) * 1000;
        }

        function isEqual(value, other) {
            return value === other
                || isObject(value)
                && isObject(other)
                && Object.keys(value).length === Object.keys(other).length
                && each(value, function (val, key) { return val === other[key]; });
        }

        function swap(value, a, b) {
            return value.replace(
                new RegExp((a + "|" + b), 'g'),
                function (match) { return match === a ? b : a; }
            );
        }

        var assign = Object.assign || function (target) {
            var args = [], len = arguments.length - 1;
            while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

            target = Object(target);
            for (var i = 0; i < args.length; i++) {
                var source = args[i];
                if (source !== null) {
                    for (var key in source) {
                        if (hasOwn(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        };

        function last(array) {
            return array[array.length - 1];
        }

        function each(obj, cb) {
            for (var key in obj) {
                if (false === cb(obj[key], key)) {
                    return false;
                }
            }
            return true;
        }

        function sortBy(array, prop) {
            return array.sort(function (ref, ref$1) {
                    var propA = ref[prop]; if ( propA === void 0 ) propA = 0;
                    var propB = ref$1[prop]; if ( propB === void 0 ) propB = 0;

                    return propA > propB
                    ? 1
                    : propB > propA
                        ? -1
                        : 0;
            }
            );
        }

        function uniqueBy(array, prop) {
            var seen = new Set();
            return array.filter(function (ref) {
                var check = ref[prop];

                return seen.has(check)
                ? false
                : seen.add(check) || true;
            } // IE 11 does not return the Set object
            );
        }

        function clamp(number, min, max) {
            if ( min === void 0 ) min = 0;
            if ( max === void 0 ) max = 1;

            return Math.min(Math.max(toNumber(number) || 0, min), max);
        }

        function noop() {}

        function intersectRect(r1, r2) {
            return r1.left < r2.right &&
                r1.right > r2.left &&
                r1.top < r2.bottom &&
                r1.bottom > r2.top;
        }

        function pointInRect(point, rect) {
            return point.x <= rect.right &&
                point.x >= rect.left &&
                point.y <= rect.bottom &&
                point.y >= rect.top;
        }

        var Dimensions = {

            ratio: function(dimensions, prop, value) {
                var obj;


                var aProp = prop === 'width' ? 'height' : 'width';

                return ( obj = {}, obj[aProp] = dimensions[prop] ? Math.round(value * dimensions[aProp] / dimensions[prop]) : dimensions[aProp], obj[prop] = value, obj );
            },

            contain: function(dimensions, maxDimensions) {
                var this$1 = this;

                dimensions = assign({}, dimensions);

                each(dimensions, function (_, prop) { return dimensions = dimensions[prop] > maxDimensions[prop]
                    ? this$1.ratio(dimensions, prop, maxDimensions[prop])
                    : dimensions; }
                );

                return dimensions;
            },

            cover: function(dimensions, maxDimensions) {
                var this$1 = this;

                dimensions = this.contain(dimensions, maxDimensions);

                each(dimensions, function (_, prop) { return dimensions = dimensions[prop] < maxDimensions[prop]
                    ? this$1.ratio(dimensions, prop, maxDimensions[prop])
                    : dimensions; }
                );

                return dimensions;
            }

        };

        function attr(element, name, value) {

            if (isObject(name)) {
                for (var key in name) {
                    attr(element, key, name[key]);
                }
                return;
            }

            if (isUndefined(value)) {
                element = toNode(element);
                return element && element.getAttribute(name);
            } else {
                toNodes(element).forEach(function (element) {

                    if (isFunction(value)) {
                        value = value.call(element, attr(element, name));
                    }

                    if (value === null) {
                        removeAttr(element, name);
                    } else {
                        element.setAttribute(name, value);
                    }
                });
            }

        }

        function hasAttr(element, name) {
            return toNodes(element).some(function (element) { return element.hasAttribute(name); });
        }

        function removeAttr(element, name) {
            element = toNodes(element);
            name.split(' ').forEach(function (name) { return element.forEach(function (element) { return element.hasAttribute(name) && element.removeAttribute(name); }
                ); }
            );
        }

        function data(element, attribute) {
            for (var i = 0, attrs = [attribute, ("data-" + attribute)]; i < attrs.length; i++) {
                if (hasAttr(element, attrs[i])) {
                    return attr(element, attrs[i]);
                }
            }
        }

        /* global DocumentTouch */

        var isIE = /msie|trident/i.test(window.navigator.userAgent);
        var isRtl = attr(document.documentElement, 'dir') === 'rtl';

        var hasTouchEvents = 'ontouchstart' in window;
        var hasPointerEvents = window.PointerEvent;
        var hasTouch = hasTouchEvents
            || window.DocumentTouch && document instanceof DocumentTouch
            || navigator.maxTouchPoints; // IE >=11

        var pointerDown = hasPointerEvents ? 'pointerdown' : hasTouchEvents ? 'touchstart' : 'mousedown';
        var pointerMove = hasPointerEvents ? 'pointermove' : hasTouchEvents ? 'touchmove' : 'mousemove';
        var pointerUp = hasPointerEvents ? 'pointerup' : hasTouchEvents ? 'touchend' : 'mouseup';
        var pointerEnter = hasPointerEvents ? 'pointerenter' : hasTouchEvents ? '' : 'mouseenter';
        var pointerLeave = hasPointerEvents ? 'pointerleave' : hasTouchEvents ? '' : 'mouseleave';
        var pointerCancel = hasPointerEvents ? 'pointercancel' : 'touchcancel';

        function query(selector, context) {
            return toNode(selector) || find(selector, getContext(selector, context));
        }

        function queryAll(selector, context) {
            var nodes = toNodes(selector);
            return nodes.length && nodes || findAll(selector, getContext(selector, context));
        }

        function getContext(selector, context) {
            if ( context === void 0 ) context = document;

            return isContextSelector(selector) || isDocument(context)
                ? context
                : context.ownerDocument;
        }

        function find(selector, context) {
            return toNode(_query(selector, context, 'querySelector'));
        }

        function findAll(selector, context) {
            return toNodes(_query(selector, context, 'querySelectorAll'));
        }

        function _query(selector, context, queryFn) {
            if ( context === void 0 ) context = document;


            if (!selector || !isString(selector)) {
                return null;
            }

            selector = selector.replace(contextSanitizeRe, '$1 *');

            var removes;

            if (isContextSelector(selector)) {

                removes = [];

                selector = splitSelector(selector).map(function (selector, i) {

                    var ctx = context;

                    if (selector[0] === '!') {

                        var selectors = selector.substr(1).trim().split(' ');
                        ctx = closest(parent(context), selectors[0]);
                        selector = selectors.slice(1).join(' ').trim();

                    }

                    if (selector[0] === '-') {

                        var selectors$1 = selector.substr(1).trim().split(' ');
                        var prev = (ctx || context).previousElementSibling;
                        ctx = matches(prev, selector.substr(1)) ? prev : null;
                        selector = selectors$1.slice(1).join(' ');

                    }

                    if (!ctx) {
                        return null;
                    }

                    if (!ctx.id) {
                        ctx.id = "uk-" + (Date.now()) + i;
                        removes.push(function () { return removeAttr(ctx, 'id'); });
                    }

                    return ("#" + (escape(ctx.id)) + " " + selector);

                }).filter(Boolean).join(',');

                context = document;

            }

            try {

                return context[queryFn](selector);

            } catch (e) {

                return null;

            } finally {

                removes && removes.forEach(function (remove) { return remove(); });

            }

        }

        var contextSelectorRe = /(^|[^\\],)\s*[!>+~-]/;
        var contextSanitizeRe = /([!>+~-])(?=\s+[!>+~-]|\s*$)/g;

        function isContextSelector(selector) {
            return isString(selector) && selector.match(contextSelectorRe);
        }

        var selectorRe = /.*?[^\\](?:,|$)/g;

        function splitSelector(selector) {
            return selector.match(selectorRe).map(function (selector) { return selector.replace(/,$/, '').trim(); });
        }

        var elProto = Element.prototype;
        var matchesFn = elProto.matches || elProto.webkitMatchesSelector || elProto.msMatchesSelector;

        function matches(element, selector) {
            return toNodes(element).some(function (element) { return matchesFn.call(element, selector); });
        }

        var closestFn = elProto.closest || function (selector) {
            var ancestor = this;

            do {

                if (matches(ancestor, selector)) {
                    return ancestor;
                }

            } while ((ancestor = parent(ancestor)));
        };

        function closest(element, selector) {

            if (startsWith(selector, '>')) {
                selector = selector.slice(1);
            }

            return isElement(element)
                ? closestFn.call(element, selector)
                : toNodes(element).map(function (element) { return closest(element, selector); }).filter(Boolean);
        }

        function parent(element) {
            element = toNode(element);
            return element && isElement(element.parentNode) && element.parentNode;
        }

        var escapeFn = window.CSS && CSS.escape || function (css) { return css.replace(/([^\x7f-\uFFFF\w-])/g, function (match) { return ("\\" + match); }); };
        function escape(css) {
            return isString(css) ? escapeFn.call(null, css) : '';
        }

        var voidElements = {
            area: true,
            base: true,
            br: true,
            col: true,
            embed: true,
            hr: true,
            img: true,
            input: true,
            keygen: true,
            link: true,
            menuitem: true,
            meta: true,
            param: true,
            source: true,
            track: true,
            wbr: true
        };
        function isVoidElement(element) {
            return toNodes(element).some(function (element) { return voidElements[element.tagName.toLowerCase()]; });
        }

        function isVisible(element) {
            return toNodes(element).some(function (element) { return element.offsetWidth || element.offsetHeight || element.getClientRects().length; });
        }

        var selInput = 'input,select,textarea,button';
        function isInput(element) {
            return toNodes(element).some(function (element) { return matches(element, selInput); });
        }

        function filter(element, selector) {
            return toNodes(element).filter(function (element) { return matches(element, selector); });
        }

        function within(element, selector) {
            return !isString(selector)
                ? element === selector || (isDocument(selector)
                    ? selector.documentElement
                    : toNode(selector)).contains(toNode(element)) // IE 11 document does not implement contains
                : matches(element, selector) || closest(element, selector);
        }

        function parents(element, selector) {
            var elements = [];

            while ((element = parent(element))) {
                if (!selector || matches(element, selector)) {
                    elements.push(element);
                }
            }

            return elements;
        }

        function children(element, selector) {
            element = toNode(element);
            var children = element ? toNodes(element.children) : [];
            return selector ? filter(children, selector) : children;
        }

        function on() {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];


            var ref = getArgs(args);
            var targets = ref[0];
            var type = ref[1];
            var selector = ref[2];
            var listener = ref[3];
            var useCapture = ref[4];

            targets = toEventTargets(targets);

            if (listener.length > 1) {
                listener = detail(listener);
            }

            if (useCapture && useCapture.self) {
                listener = selfFilter(listener);
            }

            if (selector) {
                listener = delegate(targets, selector, listener);
            }

            useCapture = useCaptureFilter(useCapture);

            type.split(' ').forEach(function (type) { return targets.forEach(function (target) { return target.addEventListener(type, listener, useCapture); }
                ); }
            );
            return function () { return off(targets, type, listener, useCapture); };
        }

        function off(targets, type, listener, useCapture) {
            if ( useCapture === void 0 ) useCapture = false;

            useCapture = useCaptureFilter(useCapture);
            targets = toEventTargets(targets);
            type.split(' ').forEach(function (type) { return targets.forEach(function (target) { return target.removeEventListener(type, listener, useCapture); }
                ); }
            );
        }

        function once() {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];


            var ref = getArgs(args);
            var element = ref[0];
            var type = ref[1];
            var selector = ref[2];
            var listener = ref[3];
            var useCapture = ref[4];
            var condition = ref[5];
            var off = on(element, type, selector, function (e) {
                var result = !condition || condition(e);
                if (result) {
                    off();
                    listener(e, result);
                }
            }, useCapture);

            return off;
        }

        function trigger(targets, event, detail) {
            return toEventTargets(targets).reduce(function (notCanceled, target) { return notCanceled && target.dispatchEvent(createEvent(event, true, true, detail)); }
                , true);
        }

        function createEvent(e, bubbles, cancelable, detail) {
            if ( bubbles === void 0 ) bubbles = true;
            if ( cancelable === void 0 ) cancelable = false;

            if (isString(e)) {
                var event = document.createEvent('CustomEvent'); // IE 11
                event.initCustomEvent(e, bubbles, cancelable, detail);
                e = event;
            }

            return e;
        }

        function getArgs(args) {
            if (isFunction(args[2])) {
                args.splice(2, 0, false);
            }
            return args;
        }

        function delegate(delegates, selector, listener) {
            var this$1 = this;

            return function (e) {

                delegates.forEach(function (delegate) {

                    var current = selector[0] === '>'
                        ? findAll(selector, delegate).reverse().filter(function (element) { return within(e.target, element); })[0]
                        : closest(e.target, selector);

                    if (current) {
                        e.delegate = delegate;
                        e.current = current;

                        listener.call(this$1, e);
                    }

                });

            };
        }

        function detail(listener) {
            return function (e) { return isArray(e.detail) ? listener.apply(void 0, [ e ].concat( e.detail )) : listener(e); };
        }

        function selfFilter(listener) {
            return function (e) {
                if (e.target === e.currentTarget || e.target === e.current) {
                    return listener.call(null, e);
                }
            };
        }

        function useCaptureFilter(options) {
            return options && isIE && !isBoolean(options)
                ? !!options.capture
                : options;
        }

        function isEventTarget(target) {
            return target && 'addEventListener' in target;
        }

        function toEventTarget(target) {
            return isEventTarget(target) ? target : toNode(target);
        }

        function toEventTargets(target) {
            return isArray(target)
                    ? target.map(toEventTarget).filter(Boolean)
                    : isString(target)
                        ? findAll(target)
                        : isEventTarget(target)
                            ? [target]
                            : toNodes(target);
        }

        function isTouch(e) {
            return e.pointerType === 'touch' || !!e.touches;
        }

        function getEventPos(e) {
            var touches = e.touches;
            var changedTouches = e.changedTouches;
            var ref = touches && touches[0] || changedTouches && changedTouches[0] || e;
            var x = ref.clientX;
            var y = ref.clientY;

            return {x: x, y: y};
        }

        /* global setImmediate */

        var Promise = 'Promise' in window ? window.Promise : PromiseFn;

        var Deferred = function() {
            var this$1 = this;

            this.promise = new Promise(function (resolve, reject) {
                this$1.reject = reject;
                this$1.resolve = resolve;
            });
        };

        /**
         * Promises/A+ polyfill v1.1.4 (https://github.com/bramstein/promis)
         */

        var RESOLVED = 0;
        var REJECTED = 1;
        var PENDING = 2;

        var async = 'setImmediate' in window ? setImmediate : setTimeout;

        function PromiseFn(executor) {

            this.state = PENDING;
            this.value = undefined;
            this.deferred = [];

            var promise = this;

            try {
                executor(
                    function (x) {
                        promise.resolve(x);
                    },
                    function (r) {
                        promise.reject(r);
                    }
                );
            } catch (e) {
                promise.reject(e);
            }
        }

        PromiseFn.reject = function (r) {
            return new PromiseFn(function (resolve, reject) {
                reject(r);
            });
        };

        PromiseFn.resolve = function (x) {
            return new PromiseFn(function (resolve, reject) {
                resolve(x);
            });
        };

        PromiseFn.all = function all(iterable) {
            return new PromiseFn(function (resolve, reject) {
                var result = [];
                var count = 0;

                if (iterable.length === 0) {
                    resolve(result);
                }

                function resolver(i) {
                    return function (x) {
                        result[i] = x;
                        count += 1;

                        if (count === iterable.length) {
                            resolve(result);
                        }
                    };
                }

                for (var i = 0; i < iterable.length; i += 1) {
                    PromiseFn.resolve(iterable[i]).then(resolver(i), reject);
                }
            });
        };

        PromiseFn.race = function race(iterable) {
            return new PromiseFn(function (resolve, reject) {
                for (var i = 0; i < iterable.length; i += 1) {
                    PromiseFn.resolve(iterable[i]).then(resolve, reject);
                }
            });
        };

        var p = PromiseFn.prototype;

        p.resolve = function resolve(x) {
            var promise = this;

            if (promise.state === PENDING) {
                if (x === promise) {
                    throw new TypeError('Promise settled with itself.');
                }

                var called = false;

                try {
                    var then = x && x.then;

                    if (x !== null && isObject(x) && isFunction(then)) {
                        then.call(
                            x,
                            function (x) {
                                if (!called) {
                                    promise.resolve(x);
                                }
                                called = true;
                            },
                            function (r) {
                                if (!called) {
                                    promise.reject(r);
                                }
                                called = true;
                            }
                        );
                        return;
                    }
                } catch (e) {
                    if (!called) {
                        promise.reject(e);
                    }
                    return;
                }

                promise.state = RESOLVED;
                promise.value = x;
                promise.notify();
            }
        };

        p.reject = function reject(reason) {
            var promise = this;

            if (promise.state === PENDING) {
                if (reason === promise) {
                    throw new TypeError('Promise settled with itself.');
                }

                promise.state = REJECTED;
                promise.value = reason;
                promise.notify();
            }
        };

        p.notify = function notify() {
            var this$1 = this;

            async(function () {
                if (this$1.state !== PENDING) {
                    while (this$1.deferred.length) {
                        var ref = this$1.deferred.shift();
                        var onResolved = ref[0];
                        var onRejected = ref[1];
                        var resolve = ref[2];
                        var reject = ref[3];

                        try {
                            if (this$1.state === RESOLVED) {
                                if (isFunction(onResolved)) {
                                    resolve(onResolved.call(undefined, this$1.value));
                                } else {
                                    resolve(this$1.value);
                                }
                            } else if (this$1.state === REJECTED) {
                                if (isFunction(onRejected)) {
                                    resolve(onRejected.call(undefined, this$1.value));
                                } else {
                                    reject(this$1.value);
                                }
                            }
                        } catch (e) {
                            reject(e);
                        }
                    }
                }
            });
        };

        p.then = function then(onResolved, onRejected) {
            var this$1 = this;

            return new PromiseFn(function (resolve, reject) {
                this$1.deferred.push([onResolved, onRejected, resolve, reject]);
                this$1.notify();
            });
        };

        p.catch = function (onRejected) {
            return this.then(undefined, onRejected);
        };

        function ajax(url, options) {
            return new Promise(function (resolve, reject) {

                var env = assign({
                    data: null,
                    method: 'GET',
                    headers: {},
                    xhr: new XMLHttpRequest(),
                    beforeSend: noop,
                    responseType: ''
                }, options);

                env.beforeSend(env);

                var xhr = env.xhr;

                for (var prop in env) {
                    if (prop in xhr) {
                        try {

                            xhr[prop] = env[prop];

                        } catch (e) {}
                    }
                }

                xhr.open(env.method.toUpperCase(), url);

                for (var header in env.headers) {
                    xhr.setRequestHeader(header, env.headers[header]);
                }

                on(xhr, 'load', function () {

                    if (xhr.status === 0 || xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                        resolve(xhr);
                    } else {
                        reject(assign(Error(xhr.statusText), {
                            xhr: xhr,
                            status: xhr.status
                        }));
                    }

                });

                on(xhr, 'error', function () { return reject(assign(Error('Network Error'), {xhr: xhr})); });
                on(xhr, 'timeout', function () { return reject(assign(Error('Network Timeout'), {xhr: xhr})); });

                xhr.send(env.data);
            });
        }

        function getImage(src, srcset, sizes) {

            return new Promise(function (resolve, reject) {
                var img = new Image();

                img.onerror = reject;
                img.onload = function () { return resolve(img); };

                sizes && (img.sizes = sizes);
                srcset && (img.srcset = srcset);
                img.src = src;
            });

        }

        function ready(fn) {

            if (document.readyState !== 'loading') {
                fn();
                return;
            }

            var unbind = on(document, 'DOMContentLoaded', function () {
                unbind();
                fn();
            });
        }

        function index(element, ref) {
            return ref
                ? toNodes(element).indexOf(toNode(ref))
                : children(parent(element)).indexOf(element);
        }

        function getIndex(i, elements, current, finite) {
            if ( current === void 0 ) current = 0;
            if ( finite === void 0 ) finite = false;


            elements = toNodes(elements);

            var length = elements.length;

            i = isNumeric(i)
                ? toNumber(i)
                : i === 'next'
                    ? current + 1
                    : i === 'previous'
                        ? current - 1
                        : index(elements, i);

            if (finite) {
                return clamp(i, 0, length - 1);
            }

            i %= length;

            return i < 0 ? i + length : i;
        }

        function empty(element) {
            element = $(element);
            element.innerHTML = '';
            return element;
        }

        function html(parent, html) {
            parent = $(parent);
            return isUndefined(html)
                ? parent.innerHTML
                : append(parent.hasChildNodes() ? empty(parent) : parent, html);
        }

        function prepend(parent, element) {

            parent = $(parent);

            if (!parent.hasChildNodes()) {
                return append(parent, element);
            } else {
                return insertNodes(element, function (element) { return parent.insertBefore(element, parent.firstChild); });
            }
        }

        function append(parent, element) {
            parent = $(parent);
            return insertNodes(element, function (element) { return parent.appendChild(element); });
        }

        function before(ref, element) {
            ref = $(ref);
            return insertNodes(element, function (element) { return ref.parentNode.insertBefore(element, ref); });
        }

        function after(ref, element) {
            ref = $(ref);
            return insertNodes(element, function (element) { return ref.nextSibling
                ? before(ref.nextSibling, element)
                : append(ref.parentNode, element); }
            );
        }

        function insertNodes(element, fn) {
            element = isString(element) ? fragment(element) : element;
            return element
                ? 'length' in element
                    ? toNodes(element).map(fn)
                    : fn(element)
                : null;
        }

        function remove(element) {
            toNodes(element).map(function (element) { return element.parentNode && element.parentNode.removeChild(element); });
        }

        function wrapAll(element, structure) {

            structure = toNode(before(element, structure));

            while (structure.firstChild) {
                structure = structure.firstChild;
            }

            append(structure, element);

            return structure;
        }

        function wrapInner(element, structure) {
            return toNodes(toNodes(element).map(function (element) { return element.hasChildNodes ? wrapAll(toNodes(element.childNodes), structure) : append(element, structure); }
            ));
        }

        function unwrap(element) {
            toNodes(element)
                .map(parent)
                .filter(function (value, index, self) { return self.indexOf(value) === index; })
                .forEach(function (parent) {
                    before(parent, parent.childNodes);
                    remove(parent);
                });
        }

        var fragmentRe = /^\s*<(\w+|!)[^>]*>/;
        var singleTagRe = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

        function fragment(html) {

            var matches = singleTagRe.exec(html);
            if (matches) {
                return document.createElement(matches[1]);
            }

            var container = document.createElement('div');
            if (fragmentRe.test(html)) {
                container.insertAdjacentHTML('beforeend', html.trim());
            } else {
                container.textContent = html;
            }

            return container.childNodes.length > 1 ? toNodes(container.childNodes) : container.firstChild;

        }

        function apply(node, fn) {

            if (!isElement(node)) {
                return;
            }

            fn(node);
            node = node.firstElementChild;
            while (node) {
                var next = node.nextElementSibling;
                apply(node, fn);
                node = next;
            }
        }

        function $(selector, context) {
            return !isString(selector)
                ? toNode(selector)
                : isHtml(selector)
                    ? toNode(fragment(selector))
                    : find(selector, context);
        }

        function $$(selector, context) {
            return !isString(selector)
                ? toNodes(selector)
                : isHtml(selector)
                    ? toNodes(fragment(selector))
                    : findAll(selector, context);
        }

        function isHtml(str) {
            return str[0] === '<' || str.match(/^\s*</);
        }

        function addClass(element) {
            var args = [], len = arguments.length - 1;
            while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

            apply$1(element, args, 'add');
        }

        function removeClass(element) {
            var args = [], len = arguments.length - 1;
            while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

            apply$1(element, args, 'remove');
        }

        function removeClasses(element, cls) {
            attr(element, 'class', function (value) { return (value || '').replace(new RegExp(("\\b" + cls + "\\b"), 'g'), ''); });
        }

        function replaceClass(element) {
            var args = [], len = arguments.length - 1;
            while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

            args[0] && removeClass(element, args[0]);
            args[1] && addClass(element, args[1]);
        }

        function hasClass(element, cls) {
            return cls && toNodes(element).some(function (element) { return element.classList.contains(cls.split(' ')[0]); });
        }

        function toggleClass(element) {
            var args = [], len = arguments.length - 1;
            while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];


            if (!args.length) {
                return;
            }

            args = getArgs$1(args);

            var force = !isString(last(args)) ? args.pop() : []; // in iOS 9.3 force === undefined evaluates to false

            args = args.filter(Boolean);

            toNodes(element).forEach(function (ref) {
                var classList = ref.classList;

                for (var i = 0; i < args.length; i++) {
                    supports.Force
                        ? classList.toggle.apply(classList, [args[i]].concat(force))
                        : (classList[(!isUndefined(force) ? force : !classList.contains(args[i])) ? 'add' : 'remove'](args[i]));
                }
            });

        }

        function apply$1(element, args, fn) {
            args = getArgs$1(args).filter(Boolean);

            args.length && toNodes(element).forEach(function (ref) {
                var classList = ref.classList;

                supports.Multiple
                    ? classList[fn].apply(classList, args)
                    : args.forEach(function (cls) { return classList[fn](cls); });
            });
        }

        function getArgs$1(args) {
            return args.reduce(function (args, arg) { return args.concat.call(args, isString(arg) && includes(arg, ' ') ? arg.trim().split(' ') : arg); }
                , []);
        }

        // IE 11
        var supports = {

            get Multiple() {
                return this.get('_multiple');
            },

            get Force() {
                return this.get('_force');
            },

            get: function(key) {

                if (!hasOwn(this, key)) {
                    var ref = document.createElement('_');
                    var classList = ref.classList;
                    classList.add('a', 'b');
                    classList.toggle('c', false);
                    this._multiple = classList.contains('b');
                    this._force = !classList.contains('c');
                }

                return this[key];
            }

        };

        var cssNumber = {
            'animation-iteration-count': true,
            'column-count': true,
            'fill-opacity': true,
            'flex-grow': true,
            'flex-shrink': true,
            'font-weight': true,
            'line-height': true,
            'opacity': true,
            'order': true,
            'orphans': true,
            'stroke-dasharray': true,
            'stroke-dashoffset': true,
            'widows': true,
            'z-index': true,
            'zoom': true
        };

        function css(element, property, value) {

            return toNodes(element).map(function (element) {

                if (isString(property)) {

                    property = propName(property);

                    if (isUndefined(value)) {
                        return getStyle(element, property);
                    } else if (!value && !isNumber(value)) {
                        element.style.removeProperty(property);
                    } else {
                        element.style[property] = isNumeric(value) && !cssNumber[property] ? (value + "px") : value;
                    }

                } else if (isArray(property)) {

                    var styles = getStyles(element);

                    return property.reduce(function (props, property) {
                        props[property] = styles[propName(property)];
                        return props;
                    }, {});

                } else if (isObject(property)) {
                    each(property, function (value, property) { return css(element, property, value); });
                }

                return element;

            })[0];

        }

        function getStyles(element, pseudoElt) {
            element = toNode(element);
            return element.ownerDocument.defaultView.getComputedStyle(element, pseudoElt);
        }

        function getStyle(element, property, pseudoElt) {
            return getStyles(element, pseudoElt)[property];
        }

        var vars = {};

        function getCssVar(name) {

            var docEl = document.documentElement;

            if (!isIE) {
                return getStyles(docEl).getPropertyValue(("--uk-" + name));
            }

            if (!(name in vars)) {

                /* usage in css: .uk-name:before { content:"xyz" } */

                var element = append(docEl, document.createElement('div'));

                addClass(element, ("uk-" + name));

                vars[name] = getStyle(element, 'content', ':before').replace(/^["'](.*)["']$/, '$1');

                remove(element);

            }

            return vars[name];

        }

        var cssProps = {};

        function propName(name) {

            var ret = cssProps[name];
            if (!ret) {
                ret = cssProps[name] = vendorPropName(name) || name;
            }
            return ret;
        }

        var cssPrefixes = ['webkit', 'moz', 'ms'];

        function vendorPropName(name) {

            name = hyphenate(name);

            var ref = document.documentElement;
            var style = ref.style;

            if (name in style) {
                return name;
            }

            var i = cssPrefixes.length, prefixedName;

            while (i--) {
                prefixedName = "-" + (cssPrefixes[i]) + "-" + name;
                if (prefixedName in style) {
                    return prefixedName;
                }
            }
        }

        function transition(element, props, duration, timing) {
            if ( duration === void 0 ) duration = 400;
            if ( timing === void 0 ) timing = 'linear';


            return Promise.all(toNodes(element).map(function (element) { return new Promise(function (resolve, reject) {

                    for (var name in props) {
                        var value = css(element, name);
                        if (value === '') {
                            css(element, name, value);
                        }
                    }

                    var timer = setTimeout(function () { return trigger(element, 'transitionend'); }, duration);

                    once(element, 'transitionend transitioncanceled', function (ref) {
                        var type = ref.type;

                        clearTimeout(timer);
                        removeClass(element, 'uk-transition');
                        css(element, {
                            transitionProperty: '',
                            transitionDuration: '',
                            transitionTimingFunction: ''
                        });
                        type === 'transitioncanceled' ? reject() : resolve();
                    }, {self: true});

                    addClass(element, 'uk-transition');
                    css(element, assign({
                        transitionProperty: Object.keys(props).map(propName).join(','),
                        transitionDuration: (duration + "ms"),
                        transitionTimingFunction: timing
                    }, props));

                }); }
            ));

        }

        var Transition = {

            start: transition,

            stop: function(element) {
                trigger(element, 'transitionend');
                return Promise.resolve();
            },

            cancel: function(element) {
                trigger(element, 'transitioncanceled');
            },

            inProgress: function(element) {
                return hasClass(element, 'uk-transition');
            }

        };

        var animationPrefix = 'uk-animation-';
        var clsCancelAnimation = 'uk-cancel-animation';

        function animate(element, animation, duration, origin, out) {
            var arguments$1 = arguments;
            if ( duration === void 0 ) duration = 200;


            return Promise.all(toNodes(element).map(function (element) { return new Promise(function (resolve, reject) {

                    if (hasClass(element, clsCancelAnimation)) {
                        requestAnimationFrame(function () { return Promise.resolve().then(function () { return animate.apply(void 0, arguments$1).then(resolve, reject); }
                            ); }
                        );
                        return;
                    }

                    var cls = animation + " " + animationPrefix + (out ? 'leave' : 'enter');

                    if (startsWith(animation, animationPrefix)) {

                        if (origin) {
                            cls += " uk-transform-origin-" + origin;
                        }

                        if (out) {
                            cls += " " + animationPrefix + "reverse";
                        }

                    }

                    reset();

                    once(element, 'animationend animationcancel', function (ref) {
                        var type = ref.type;


                        var hasReset = false;

                        if (type === 'animationcancel') {
                            reject();
                            reset();
                        } else {
                            resolve();
                            Promise.resolve().then(function () {
                                hasReset = true;
                                reset();
                            });
                        }

                        requestAnimationFrame(function () {
                            if (!hasReset) {
                                addClass(element, clsCancelAnimation);

                                requestAnimationFrame(function () { return removeClass(element, clsCancelAnimation); });
                            }
                        });

                    }, {self: true});

                    css(element, 'animationDuration', (duration + "ms"));
                    addClass(element, cls);

                    function reset() {
                        css(element, 'animationDuration', '');
                        removeClasses(element, (animationPrefix + "\\S*"));
                    }

                }); }
            ));

        }

        var inProgress = new RegExp((animationPrefix + "(enter|leave)"));
        var Animation = {

            in: function(element, animation, duration, origin) {
                return animate(element, animation, duration, origin, false);
            },

            out: function(element, animation, duration, origin) {
                return animate(element, animation, duration, origin, true);
            },

            inProgress: function(element) {
                return inProgress.test(attr(element, 'class'));
            },

            cancel: function(element) {
                trigger(element, 'animationcancel');
            }

        };

        var dirs = {
            width: ['x', 'left', 'right'],
            height: ['y', 'top', 'bottom']
        };

        function positionAt(element, target, elAttach, targetAttach, elOffset, targetOffset, flip, boundary) {

            elAttach = getPos(elAttach);
            targetAttach = getPos(targetAttach);

            var flipped = {element: elAttach, target: targetAttach};

            if (!element || !target) {
                return flipped;
            }

            var dim = getDimensions(element);
            var targetDim = getDimensions(target);
            var position = targetDim;

            moveTo(position, elAttach, dim, -1);
            moveTo(position, targetAttach, targetDim, 1);

            elOffset = getOffsets(elOffset, dim.width, dim.height);
            targetOffset = getOffsets(targetOffset, targetDim.width, targetDim.height);

            elOffset['x'] += targetOffset['x'];
            elOffset['y'] += targetOffset['y'];

            position.left += elOffset['x'];
            position.top += elOffset['y'];

            if (flip) {

                var boundaries = [getDimensions(toWindow(element))];

                if (boundary) {
                    boundaries.unshift(getDimensions(boundary));
                }

                each(dirs, function (ref, prop) {
                    var dir = ref[0];
                    var align = ref[1];
                    var alignFlip = ref[2];


                    if (!(flip === true || includes(flip, dir))) {
                        return;
                    }

                    boundaries.some(function (boundary) {

                        var elemOffset = elAttach[dir] === align
                            ? -dim[prop]
                            : elAttach[dir] === alignFlip
                                ? dim[prop]
                                : 0;

                        var targetOffset = targetAttach[dir] === align
                            ? targetDim[prop]
                            : targetAttach[dir] === alignFlip
                                ? -targetDim[prop]
                                : 0;

                        if (position[align] < boundary[align] || position[align] + dim[prop] > boundary[alignFlip]) {

                            var centerOffset = dim[prop] / 2;
                            var centerTargetOffset = targetAttach[dir] === 'center' ? -targetDim[prop] / 2 : 0;

                            return elAttach[dir] === 'center' && (
                                apply(centerOffset, centerTargetOffset)
                                || apply(-centerOffset, -centerTargetOffset)
                            ) || apply(elemOffset, targetOffset);

                        }

                        function apply(elemOffset, targetOffset) {

                            var newVal = position[align] + elemOffset + targetOffset - elOffset[dir] * 2;

                            if (newVal >= boundary[align] && newVal + dim[prop] <= boundary[alignFlip]) {
                                position[align] = newVal;

                                ['element', 'target'].forEach(function (el) {
                                    flipped[el][dir] = !elemOffset
                                        ? flipped[el][dir]
                                        : flipped[el][dir] === dirs[prop][1]
                                            ? dirs[prop][2]
                                            : dirs[prop][1];
                                });

                                return true;
                            }

                        }

                    });

                });
            }

            offset(element, position);

            return flipped;
        }

        function offset(element, coordinates) {

            if (!coordinates) {
                return getDimensions(element);
            }

            var currentOffset = offset(element);
            var pos = css(element, 'position');

            ['left', 'top'].forEach(function (prop) {
                if (prop in coordinates) {
                    var value = css(element, prop);
                    css(element, prop, coordinates[prop] - currentOffset[prop]
                        + toFloat(pos === 'absolute' && value === 'auto'
                            ? position(element)[prop]
                            : value)
                    );
                }
            });
        }

        function getDimensions(element) {

            if (!element) {
                return {};
            }

            var ref = toWindow(element);
            var top = ref.pageYOffset;
            var left = ref.pageXOffset;

            if (isWindow(element)) {

                var height = element.innerHeight;
                var width = element.innerWidth;

                return {
                    top: top,
                    left: left,
                    height: height,
                    width: width,
                    bottom: top + height,
                    right: left + width
                };
            }

            var style, hidden;

            if (!isVisible(element) && css(element, 'display') === 'none') {

                style = attr(element, 'style');
                hidden = attr(element, 'hidden');

                attr(element, {
                    style: ((style || '') + ";display:block !important;"),
                    hidden: null
                });
            }

            element = toNode(element);

            var rect = element.getBoundingClientRect();

            if (!isUndefined(style)) {
                attr(element, {style: style, hidden: hidden});
            }

            return {
                height: rect.height,
                width: rect.width,
                top: rect.top + top,
                left: rect.left + left,
                bottom: rect.bottom + top,
                right: rect.right + left
            };
        }

        function position(element, parent) {

            parent = parent || toNode(element).offsetParent || toWindow(element).document.documentElement;

            var elementOffset = offset(element);
            var parentOffset = offset(parent);

            return {
                top: elementOffset.top - parentOffset.top - toFloat(css(parent, 'borderTopWidth')),
                left: elementOffset.left - parentOffset.left - toFloat(css(parent, 'borderLeftWidth'))
            };
        }

        function offsetPosition(element) {
            var offset = [0, 0];

            element = toNode(element);

            do {

                offset[0] += element.offsetTop;
                offset[1] += element.offsetLeft;

                if (css(element, 'position') === 'fixed') {
                    var win = toWindow(element);
                    offset[0] += win.pageYOffset;
                    offset[1] += win.pageXOffset;
                    return offset;
                }

            } while ((element = element.offsetParent));

            return offset;
        }

        var height = dimension('height');
        var width = dimension('width');

        function dimension(prop) {
            var propName = ucfirst(prop);
            return function (element, value) {

                if (isUndefined(value)) {

                    if (isWindow(element)) {
                        return element[("inner" + propName)];
                    }

                    if (isDocument(element)) {
                        var doc = element.documentElement;
                        return Math.max(doc[("offset" + propName)], doc[("scroll" + propName)]);
                    }

                    element = toNode(element);

                    value = css(element, prop);
                    value = value === 'auto' ? element[("offset" + propName)] : toFloat(value) || 0;

                    return value - boxModelAdjust(element, prop);

                } else {

                    css(element, prop, !value && value !== 0
                        ? ''
                        : +value + boxModelAdjust(element, prop) + 'px'
                    );

                }

            };
        }

        function boxModelAdjust(element, prop, sizing) {
            if ( sizing === void 0 ) sizing = 'border-box';

            return css(element, 'boxSizing') === sizing
                ? dirs[prop].slice(1).map(ucfirst).reduce(function (value, prop) { return value
                    + toFloat(css(element, ("padding" + prop)))
                    + toFloat(css(element, ("border" + prop + "Width"))); }
                    , 0)
                : 0;
        }

        function moveTo(position, attach, dim, factor) {
            each(dirs, function (ref, prop) {
                var dir = ref[0];
                var align = ref[1];
                var alignFlip = ref[2];

                if (attach[dir] === alignFlip) {
                    position[align] += dim[prop] * factor;
                } else if (attach[dir] === 'center') {
                    position[align] += dim[prop] * factor / 2;
                }
            });
        }

        function getPos(pos) {

            var x = /left|center|right/;
            var y = /top|center|bottom/;

            pos = (pos || '').split(' ');

            if (pos.length === 1) {
                pos = x.test(pos[0])
                    ? pos.concat('center')
                    : y.test(pos[0])
                        ? ['center'].concat(pos)
                        : ['center', 'center'];
            }

            return {
                x: x.test(pos[0]) ? pos[0] : 'center',
                y: y.test(pos[1]) ? pos[1] : 'center'
            };
        }

        function getOffsets(offsets, width, height) {

            var ref = (offsets || '').split(' ');
            var x = ref[0];
            var y = ref[1];

            return {
                x: x ? toFloat(x) * (endsWith(x, '%') ? width / 100 : 1) : 0,
                y: y ? toFloat(y) * (endsWith(y, '%') ? height / 100 : 1) : 0
            };
        }

        function flipPosition(pos) {
            switch (pos) {
                case 'left':
                    return 'right';
                case 'right':
                    return 'left';
                case 'top':
                    return 'bottom';
                case 'bottom':
                    return 'top';
                default:
                    return pos;
            }
        }

        function toPx(value, property, element) {
            if ( property === void 0 ) property = 'width';
            if ( element === void 0 ) element = window;

            return isNumeric(value)
                ? +value
                : endsWith(value, 'vh')
                    ? percent(height(toWindow(element)), value)
                    : endsWith(value, 'vw')
                        ? percent(width(toWindow(element)), value)
                        : endsWith(value, '%')
                            ? percent(getDimensions(element)[property], value)
                            : toFloat(value);
        }

        function percent(base, value) {
            return base * toFloat(value) / 100;
        }

        /*
            Based on:
            Copyright (c) 2016 Wilson Page wilsonpage@me.com
            https://github.com/wilsonpage/fastdom
        */

        var fastdom = {

            reads: [],
            writes: [],

            read: function(task) {
                this.reads.push(task);
                scheduleFlush();
                return task;
            },

            write: function(task) {
                this.writes.push(task);
                scheduleFlush();
                return task;
            },

            clear: function(task) {
                return remove$1(this.reads, task) || remove$1(this.writes, task);
            },

            flush: flush

        };

        function flush(recursion) {
            if ( recursion === void 0 ) recursion = 1;

            runTasks(fastdom.reads);
            runTasks(fastdom.writes.splice(0, fastdom.writes.length));

            fastdom.scheduled = false;

            if (fastdom.reads.length || fastdom.writes.length) {
                scheduleFlush(recursion + 1);
            }
        }

        var RECURSION_LIMIT = 5;
        function scheduleFlush(recursion) {
            if (!fastdom.scheduled) {
                fastdom.scheduled = true;
                if (recursion > RECURSION_LIMIT) {
                    throw new Error('Maximum recursion limit reached.');
                } else if (recursion) {
                    Promise.resolve().then(function () { return flush(recursion); });
                } else {
                    requestAnimationFrame(function () { return flush(); });
                }
            }
        }

        function runTasks(tasks) {
            var task;
            while ((task = tasks.shift())) {
                task();
            }
        }

        function remove$1(array, item) {
            var index = array.indexOf(item);
            return !!~index && !!array.splice(index, 1);
        }

        function MouseTracker() {}

        MouseTracker.prototype = {

            positions: [],

            init: function() {
                var this$1 = this;


                this.positions = [];

                var position;
                this.unbind = on(document, 'mousemove', function (e) { return position = getEventPos(e); });
                this.interval = setInterval(function () {

                    if (!position) {
                        return;
                    }

                    this$1.positions.push(position);

                    if (this$1.positions.length > 5) {
                        this$1.positions.shift();
                    }
                }, 50);

            },

            cancel: function() {
                this.unbind && this.unbind();
                this.interval && clearInterval(this.interval);
            },

            movesTo: function(target) {

                if (this.positions.length < 2) {
                    return false;
                }

                var p = target.getBoundingClientRect();
                var left = p.left;
                var right = p.right;
                var top = p.top;
                var bottom = p.bottom;

                var ref = this.positions;
                var prevPosition = ref[0];
                var position = last(this.positions);
                var path = [prevPosition, position];

                if (pointInRect(position, p)) {
                    return false;
                }

                var diagonals = [[{x: left, y: top}, {x: right, y: bottom}], [{x: left, y: bottom}, {x: right, y: top}]];

                return diagonals.some(function (diagonal) {
                    var intersection = intersect(path, diagonal);
                    return intersection && pointInRect(intersection, p);
                });
            }

        };

        // Inspired by http://paulbourke.net/geometry/pointlineplane/
        function intersect(ref, ref$1) {
            var ref_0 = ref[0];
            var x1 = ref_0.x;
            var y1 = ref_0.y;
            var ref_1 = ref[1];
            var x2 = ref_1.x;
            var y2 = ref_1.y;
            var ref$1_0 = ref$1[0];
            var x3 = ref$1_0.x;
            var y3 = ref$1_0.y;
            var ref$1_1 = ref$1[1];
            var x4 = ref$1_1.x;
            var y4 = ref$1_1.y;


            var denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

            // Lines are parallel
            if (denominator === 0) {
                return false;
            }

            var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;

            if (ua < 0) {
                return false;
            }

            // Return a object with the x and y coordinates of the intersection
            return {x: x1 + ua * (x2 - x1), y: y1 + ua * (y2 - y1)};
        }

        var strats = {};

        strats.events =
        strats.created =
        strats.beforeConnect =
        strats.connected =
        strats.beforeDisconnect =
        strats.disconnected =
        strats.destroy = concatStrat;

        // args strategy
        strats.args = function (parentVal, childVal) {
            return childVal !== false && concatStrat(childVal || parentVal);
        };

        // update strategy
        strats.update = function (parentVal, childVal) {
            return sortBy(concatStrat(parentVal, isFunction(childVal) ? {read: childVal} : childVal), 'order');
        };

        // property strategy
        strats.props = function (parentVal, childVal) {

            if (isArray(childVal)) {
                childVal = childVal.reduce(function (value, key) {
                    value[key] = String;
                    return value;
                }, {});
            }

            return strats.methods(parentVal, childVal);
        };

        // extend strategy
        strats.computed =
        strats.methods = function (parentVal, childVal) {
            return childVal
                ? parentVal
                    ? assign({}, parentVal, childVal)
                    : childVal
                : parentVal;
        };

        // data strategy
        strats.data = function (parentVal, childVal, vm) {

            if (!vm) {

                if (!childVal) {
                    return parentVal;
                }

                if (!parentVal) {
                    return childVal;
                }

                return function (vm) {
                    return mergeFnData(parentVal, childVal, vm);
                };

            }

            return mergeFnData(parentVal, childVal, vm);
        };

        function mergeFnData(parentVal, childVal, vm) {
            return strats.computed(
                isFunction(parentVal)
                    ? parentVal.call(vm, vm)
                    : parentVal,
                isFunction(childVal)
                    ? childVal.call(vm, vm)
                    : childVal
            );
        }

        // concat strategy
        function concatStrat(parentVal, childVal) {

            parentVal = parentVal && !isArray(parentVal) ? [parentVal] : parentVal;

            return childVal
                ? parentVal
                    ? parentVal.concat(childVal)
                    : isArray(childVal)
                        ? childVal
                        : [childVal]
                : parentVal;
        }

        // default strategy
        function defaultStrat(parentVal, childVal) {
            return isUndefined(childVal) ? parentVal : childVal;
        }

        function mergeOptions(parent, child, vm) {

            var options = {};

            if (isFunction(child)) {
                child = child.options;
            }

            if (child.extends) {
                parent = mergeOptions(parent, child.extends, vm);
            }

            if (child.mixins) {
                for (var i = 0, l = child.mixins.length; i < l; i++) {
                    parent = mergeOptions(parent, child.mixins[i], vm);
                }
            }

            for (var key in parent) {
                mergeKey(key);
            }

            for (var key$1 in child) {
                if (!hasOwn(parent, key$1)) {
                    mergeKey(key$1);
                }
            }

            function mergeKey(key) {
                options[key] = (strats[key] || defaultStrat)(parent[key], child[key], vm);
            }

            return options;
        }

        function parseOptions(options, args) {
            var obj;

            if ( args === void 0 ) args = [];

            try {

                return !options
                    ? {}
                    : startsWith(options, '{')
                        ? JSON.parse(options)
                        : args.length && !includes(options, ':')
                            ? (( obj = {}, obj[args[0]] = options, obj ))
                            : options.split(';').reduce(function (options, option) {
                                var ref = option.split(/:(.*)/);
                                var key = ref[0];
                                var value = ref[1];
                                if (key && !isUndefined(value)) {
                                    options[key.trim()] = value.trim();
                                }
                                return options;
                            }, {});

            } catch (e) {
                return {};
            }

        }

        var id = 0;

        var Player = function(el) {
            this.id = ++id;
            this.el = toNode(el);
        };

        Player.prototype.isVideo = function () {
            return this.isYoutube() || this.isVimeo() || this.isHTML5();
        };

        Player.prototype.isHTML5 = function () {
            return this.el.tagName === 'VIDEO';
        };

        Player.prototype.isIFrame = function () {
            return this.el.tagName === 'IFRAME';
        };

        Player.prototype.isYoutube = function () {
            return this.isIFrame() && !!this.el.src.match(/\/\/.*?youtube(-nocookie)?\.[a-z]+\/(watch\?v=[^&\s]+|embed)|youtu\.be\/.*/);
        };

        Player.prototype.isVimeo = function () {
            return this.isIFrame() && !!this.el.src.match(/vimeo\.com\/video\/.*/);
        };

        Player.prototype.enableApi = function () {
                var this$1 = this;


            if (this.ready) {
                return this.ready;
            }

            var youtube = this.isYoutube();
            var vimeo = this.isVimeo();

            var poller;

            if (youtube || vimeo) {

                return this.ready = new Promise(function (resolve) {

                    once(this$1.el, 'load', function () {
                        if (youtube) {
                            var listener = function () { return post(this$1.el, {event: 'listening', id: this$1.id}); };
                            poller = setInterval(listener, 100);
                            listener();
                        }
                    });

                    listen(function (data) { return youtube && data.id === this$1.id && data.event === 'onReady' || vimeo && Number(data.player_id) === this$1.id; })
                        .then(function () {
                            resolve();
                            poller && clearInterval(poller);
                        });

                    attr(this$1.el, 'src', ("" + (this$1.el.src) + (includes(this$1.el.src, '?') ? '&' : '?') + (youtube ? 'enablejsapi=1' : ("api=1&player_id=" + (this$1.id)))));

                });

            }

            return Promise.resolve();

        };

        Player.prototype.play = function () {
                var this$1 = this;


            if (!this.isVideo()) {
                return;
            }

            if (this.isIFrame()) {
                this.enableApi().then(function () { return post(this$1.el, {func: 'playVideo', method: 'play'}); });
            } else if (this.isHTML5()) {
                try {
                    var promise = this.el.play();

                    if (promise) {
                        promise.catch(noop);
                    }
                } catch (e) {}
            }
        };

        Player.prototype.pause = function () {
                var this$1 = this;


            if (!this.isVideo()) {
                return;
            }

            if (this.isIFrame()) {
                this.enableApi().then(function () { return post(this$1.el, {func: 'pauseVideo', method: 'pause'}); });
            } else if (this.isHTML5()) {
                this.el.pause();
            }
        };

        Player.prototype.mute = function () {
                var this$1 = this;


            if (!this.isVideo()) {
                return;
            }

            if (this.isIFrame()) {
                this.enableApi().then(function () { return post(this$1.el, {func: 'mute', method: 'setVolume', value: 0}); });
            } else if (this.isHTML5()) {
                this.el.muted = true;
                attr(this.el, 'muted', '');
            }

        };

        function post(el, cmd) {
            try {
                el.contentWindow.postMessage(JSON.stringify(assign({event: 'command'}, cmd)), '*');
            } catch (e) {}
        }

        function listen(cb) {

            return new Promise(function (resolve) { return once(window, 'message', function (_, data) { return resolve(data); }, false, function (ref) {
                    var data = ref.data;


                    if (!data || !isString(data)) {
                        return;
                    }

                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        return;
                    }

                    return data && cb(data);

                }); }

            );

        }

        function isInView(element, offsetTop, offsetLeft) {
            if ( offsetTop === void 0 ) offsetTop = 0;
            if ( offsetLeft === void 0 ) offsetLeft = 0;


            if (!isVisible(element)) {
                return false;
            }

            var parents = overflowParents(element).concat(element);

            for (var i = 0; i < parents.length - 1; i++) {
                var ref = offset(getViewport(parents[i]));
                var top = ref.top;
                var left = ref.left;
                var bottom = ref.bottom;
                var right = ref.right;
                var vp = {
                    top: top - offsetTop,
                    left: left - offsetLeft,
                    bottom: bottom + offsetTop,
                    right: right + offsetLeft
                };

                var client = offset(parents[i + 1]);

                if (!intersectRect(client, vp) && !pointInRect({x: client.left, y: client.top}, vp)) {
                    return false;
                }
            }

            return true;
        }

        function scrollTop(element, top) {

            if (isWindow(element) || isDocument(element)) {
                element = getScrollingElement(element);
            } else {
                element = toNode(element);
            }

            element.scrollTop = top;
        }

        function scrollIntoView(element, ref) {
            if ( ref === void 0 ) ref = {};
            var offsetBy = ref.offset; if ( offsetBy === void 0 ) offsetBy = 0;


            if (!isVisible(element)) {
                return;
            }

            var parents = overflowParents(element).concat(element);

            var promise = Promise.resolve();
            var loop = function ( i ) {
                promise = promise.then(function () { return new Promise(function (resolve) {

                        var scrollElement = parents[i];
                        var element = parents[i + 1];

                        var scroll = scrollElement.scrollTop;
                        var top = Math.ceil(position(element, getViewport(scrollElement)).top - offsetBy);
                        var duration = getDuration(Math.abs(top));

                        var start = Date.now();
                        var step = function () {

                            var percent = ease(clamp((Date.now() - start) / duration));

                            scrollTop(scrollElement, scroll + top * percent);

                            // scroll more if we have not reached our destination
                            if (percent !== 1) {
                                requestAnimationFrame(step);
                            } else {
                                resolve();
                            }

                        };

                        step();
                    }); }
                );
            };

            for (var i = 0; i < parents.length - 1; i++) loop( i );

            return promise;

            function getDuration(dist) {
                return 40 * Math.pow(dist, .375);
            }

            function ease(k) {
                return 0.5 * (1 - Math.cos(Math.PI * k));
            }

        }

        function scrolledOver(element, heightOffset) {
            if ( heightOffset === void 0 ) heightOffset = 0;


            if (!isVisible(element)) {
                return 0;
            }

            var scrollElement = last(scrollParents(element));
            var scrollHeight = scrollElement.scrollHeight;
            var scrollTop = scrollElement.scrollTop;
            var viewport = getViewport(scrollElement);
            var viewportHeight = offset(viewport).height;
            var viewportTop = offsetPosition(element)[0] - scrollTop - offsetPosition(scrollElement)[0];
            var viewportDist = Math.min(viewportHeight, viewportTop + scrollTop);

            var top = viewportTop - viewportDist;
            var dist = Math.min(
                offset(element).height + heightOffset + viewportDist,
                scrollHeight - (viewportTop + scrollTop),
                scrollHeight - viewportHeight
            );

            return clamp(-1 * top / dist);
        }

        function scrollParents(element, overflowRe) {
            if ( overflowRe === void 0 ) overflowRe = /auto|scroll/;

            var scrollEl = getScrollingElement(element);
            var scrollParents = parents(element).filter(function (parent) { return parent === scrollEl
                || overflowRe.test(css(parent, 'overflow'))
                && parent.scrollHeight > Math.round(offset(parent).height); }
            ).reverse();
            return scrollParents.length ? scrollParents : [scrollEl];
        }

        function getViewport(scrollElement) {
            return scrollElement === getScrollingElement(scrollElement) ? window : scrollElement;
        }

        function overflowParents(element) {
            return scrollParents(element, /auto|scroll|hidden/);
        }

        function getScrollingElement(element) {
            var ref = toWindow(element);
            var document = ref.document;
            return document.scrollingElement || document.documentElement;
        }

        var IntersectionObserver = 'IntersectionObserver' in window
            ? window.IntersectionObserver
            : /*@__PURE__*/(function () {
            function IntersectionObserverClass(callback, ref) {
                var this$1 = this;
                if ( ref === void 0 ) ref = {};
                var rootMargin = ref.rootMargin; if ( rootMargin === void 0 ) rootMargin = '0 0';


                    this.targets = [];

                    var ref$1 = (rootMargin || '0 0').split(' ').map(toFloat);
                var offsetTop = ref$1[0];
                var offsetLeft = ref$1[1];

                    this.offsetTop = offsetTop;
                    this.offsetLeft = offsetLeft;

                    var pending;
                    this.apply = function () {

                        if (pending) {
                            return;
                        }

                        pending = requestAnimationFrame(function () { return setTimeout(function () {
                            var records = this$1.takeRecords();

                            if (records.length) {
                                callback(records, this$1);
                            }

                            pending = false;
                        }); });

                    };

                    this.off = on(window, 'scroll resize load', this.apply, {passive: true, capture: true});

                }

                IntersectionObserverClass.prototype.takeRecords = function () {
                    var this$1 = this;

                    return this.targets.filter(function (entry) {

                        var inView = isInView(entry.target, this$1.offsetTop, this$1.offsetLeft);

                        if (entry.isIntersecting === null || inView ^ entry.isIntersecting) {
                            entry.isIntersecting = inView;
                            return true;
                        }

                    });
                };

                IntersectionObserverClass.prototype.observe = function (target) {
                    this.targets.push({
                        target: target,
                        isIntersecting: null
                    });
                    this.apply();
                };

                IntersectionObserverClass.prototype.disconnect = function () {
                    this.targets = [];
                    this.off();
                };

            return IntersectionObserverClass;
        }());

        var util = /*#__PURE__*/Object.freeze({
            __proto__: null,
            ajax: ajax,
            getImage: getImage,
            transition: transition,
            Transition: Transition,
            animate: animate,
            Animation: Animation,
            attr: attr,
            hasAttr: hasAttr,
            removeAttr: removeAttr,
            data: data,
            addClass: addClass,
            removeClass: removeClass,
            removeClasses: removeClasses,
            replaceClass: replaceClass,
            hasClass: hasClass,
            toggleClass: toggleClass,
            positionAt: positionAt,
            offset: offset,
            position: position,
            offsetPosition: offsetPosition,
            height: height,
            width: width,
            boxModelAdjust: boxModelAdjust,
            flipPosition: flipPosition,
            toPx: toPx,
            ready: ready,
            index: index,
            getIndex: getIndex,
            empty: empty,
            html: html,
            prepend: prepend,
            append: append,
            before: before,
            after: after,
            remove: remove,
            wrapAll: wrapAll,
            wrapInner: wrapInner,
            unwrap: unwrap,
            fragment: fragment,
            apply: apply,
            $: $,
            $$: $$,
            isIE: isIE,
            isRtl: isRtl,
            hasTouch: hasTouch,
            pointerDown: pointerDown,
            pointerMove: pointerMove,
            pointerUp: pointerUp,
            pointerEnter: pointerEnter,
            pointerLeave: pointerLeave,
            pointerCancel: pointerCancel,
            on: on,
            off: off,
            once: once,
            trigger: trigger,
            createEvent: createEvent,
            toEventTargets: toEventTargets,
            isTouch: isTouch,
            getEventPos: getEventPos,
            fastdom: fastdom,
            isVoidElement: isVoidElement,
            isVisible: isVisible,
            selInput: selInput,
            isInput: isInput,
            filter: filter,
            within: within,
            parents: parents,
            children: children,
            hasOwn: hasOwn,
            hyphenate: hyphenate,
            camelize: camelize,
            ucfirst: ucfirst,
            startsWith: startsWith,
            endsWith: endsWith,
            includes: includes,
            findIndex: findIndex,
            isArray: isArray,
            isFunction: isFunction,
            isObject: isObject,
            isPlainObject: isPlainObject,
            isWindow: isWindow,
            isDocument: isDocument,
            isJQuery: isJQuery,
            isNode: isNode,
            isElement: isElement,
            isNodeCollection: isNodeCollection,
            isBoolean: isBoolean,
            isString: isString,
            isNumber: isNumber,
            isNumeric: isNumeric,
            isEmpty: isEmpty,
            isUndefined: isUndefined,
            toBoolean: toBoolean,
            toNumber: toNumber,
            toFloat: toFloat,
            toNode: toNode,
            toNodes: toNodes,
            toWindow: toWindow,
            toList: toList,
            toMs: toMs,
            isEqual: isEqual,
            swap: swap,
            assign: assign,
            last: last,
            each: each,
            sortBy: sortBy,
            uniqueBy: uniqueBy,
            clamp: clamp,
            noop: noop,
            intersectRect: intersectRect,
            pointInRect: pointInRect,
            Dimensions: Dimensions,
            MouseTracker: MouseTracker,
            mergeOptions: mergeOptions,
            parseOptions: parseOptions,
            Player: Player,
            Promise: Promise,
            Deferred: Deferred,
            IntersectionObserver: IntersectionObserver,
            query: query,
            queryAll: queryAll,
            find: find,
            findAll: findAll,
            matches: matches,
            closest: closest,
            parent: parent,
            escape: escape,
            css: css,
            getStyles: getStyles,
            getStyle: getStyle,
            getCssVar: getCssVar,
            propName: propName,
            isInView: isInView,
            scrollTop: scrollTop,
            scrollIntoView: scrollIntoView,
            scrolledOver: scrolledOver,
            scrollParents: scrollParents,
            getViewport: getViewport
        });

        function globalAPI (UIkit) {

            var DATA = UIkit.data;

            UIkit.use = function (plugin) {

                if (plugin.installed) {
                    return;
                }

                plugin.call(null, this);
                plugin.installed = true;

                return this;
            };

            UIkit.mixin = function (mixin, component) {
                component = (isString(component) ? UIkit.component(component) : component) || this;
                component.options = mergeOptions(component.options, mixin);
            };

            UIkit.extend = function (options) {

                options = options || {};

                var Super = this;
                var Sub = function UIkitComponent(options) {
                    this._init(options);
                };

                Sub.prototype = Object.create(Super.prototype);
                Sub.prototype.constructor = Sub;
                Sub.options = mergeOptions(Super.options, options);

                Sub.super = Super;
                Sub.extend = Super.extend;

                return Sub;
            };

            UIkit.update = function (element, e) {

                element = element ? toNode(element) : document.body;

                parents(element).reverse().forEach(function (element) { return update(element[DATA], e); });
                apply(element, function (element) { return update(element[DATA], e); });

            };

            var container;
            Object.defineProperty(UIkit, 'container', {

                get: function() {
                    return container || document.body;
                },

                set: function(element) {
                    container = $(element);
                }

            });

            function update(data, e) {

                if (!data) {
                    return;
                }

                for (var name in data) {
                    if (data[name]._connected) {
                        data[name]._callUpdate(e);
                    }
                }

            }
        }

        function hooksAPI (UIkit) {

            UIkit.prototype._callHook = function (hook) {
                var this$1 = this;


                var handlers = this.$options[hook];

                if (handlers) {
                    handlers.forEach(function (handler) { return handler.call(this$1); });
                }
            };

            UIkit.prototype._callConnected = function () {

                if (this._connected) {
                    return;
                }

                this._data = {};
                this._computeds = {};
                this._frames = {reads: {}, writes: {}};

                this._initProps();

                this._callHook('beforeConnect');
                this._connected = true;

                this._initEvents();
                this._initObserver();

                this._callHook('connected');
                this._callUpdate();
            };

            UIkit.prototype._callDisconnected = function () {

                if (!this._connected) {
                    return;
                }

                this._callHook('beforeDisconnect');

                if (this._observer) {
                    this._observer.disconnect();
                    this._observer = null;
                }

                this._unbindEvents();
                this._callHook('disconnected');

                this._connected = false;

            };

            UIkit.prototype._callUpdate = function (e) {
                var this$1 = this;
                if ( e === void 0 ) e = 'update';


                var type = e.type || e;

                if (includes(['update', 'resize'], type)) {
                    this._callWatches();
                }

                var updates = this.$options.update;
                var ref = this._frames;
                var reads = ref.reads;
                var writes = ref.writes;

                if (!updates) {
                    return;
                }

                updates.forEach(function (ref, i) {
                    var read = ref.read;
                    var write = ref.write;
                    var events = ref.events;


                    if (type !== 'update' && !includes(events, type)) {
                        return;
                    }

                    if (read && !includes(fastdom.reads, reads[i])) {
                        reads[i] = fastdom.read(function () {

                            var result = this$1._connected && read.call(this$1, this$1._data, type);

                            if (result === false && write) {
                                fastdom.clear(writes[i]);
                            } else if (isPlainObject(result)) {
                                assign(this$1._data, result);
                            }
                        });
                    }

                    if (write && !includes(fastdom.writes, writes[i])) {
                        writes[i] = fastdom.write(function () { return this$1._connected && write.call(this$1, this$1._data, type); });
                    }

                });

            };

            UIkit.prototype._callWatches = function () {
                var this$1 = this;


                var ref = this;
                var _frames = ref._frames;

                if (_frames.watch) {
                    return;
                }

                var initital = !hasOwn(_frames, 'watch');

                _frames.watch = fastdom.read(function () {

                    if (!this$1._connected) {
                        return;
                    }

                    var ref = this$1;
                    var computed = ref.$options.computed;
                    var _computeds = ref._computeds;

                    for (var key in computed) {

                        var hasPrev = hasOwn(_computeds, key);
                        var prev = _computeds[key];

                        delete _computeds[key];

                        var ref$1 = computed[key];
                        var watch = ref$1.watch;
                        var immediate = ref$1.immediate;
                        if (watch && (
                            initital && immediate
                            || hasPrev && !isEqual(prev, this$1[key])
                        )) {
                            watch.call(this$1, this$1[key], prev);
                        }

                    }

                    _frames.watch = null;

                });

            };

        }

        function stateAPI (UIkit) {

            var uid = 0;

            UIkit.prototype._init = function (options) {

                options = options || {};
                options.data = normalizeData(options, this.constructor.options);

                this.$options = mergeOptions(this.constructor.options, options, this);
                this.$el = null;
                this.$props = {};

                this._uid = uid++;
                this._initData();
                this._initMethods();
                this._initComputeds();
                this._callHook('created');

                if (options.el) {
                    this.$mount(options.el);
                }
            };

            UIkit.prototype._initData = function () {

                var ref = this.$options;
                var data = ref.data; if ( data === void 0 ) data = {};

                for (var key in data) {
                    this.$props[key] = this[key] = data[key];
                }
            };

            UIkit.prototype._initMethods = function () {

                var ref = this.$options;
                var methods = ref.methods;

                if (methods) {
                    for (var key in methods) {
                        this[key] = methods[key].bind(this);
                    }
                }
            };

            UIkit.prototype._initComputeds = function () {

                var ref = this.$options;
                var computed = ref.computed;

                this._computeds = {};

                if (computed) {
                    for (var key in computed) {
                        registerComputed(this, key, computed[key]);
                    }
                }
            };

            UIkit.prototype._initProps = function (props) {

                var key;

                props = props || getProps(this.$options, this.$name);

                for (key in props) {
                    if (!isUndefined(props[key])) {
                        this.$props[key] = props[key];
                    }
                }

                var exclude = [this.$options.computed, this.$options.methods];
                for (key in this.$props) {
                    if (key in props && notIn(exclude, key)) {
                        this[key] = this.$props[key];
                    }
                }
            };

            UIkit.prototype._initEvents = function () {
                var this$1 = this;


                this._events = [];

                var ref = this.$options;
                var events = ref.events;

                if (events) {

                    events.forEach(function (event) {

                        if (!hasOwn(event, 'handler')) {
                            for (var key in event) {
                                registerEvent(this$1, event[key], key);
                            }
                        } else {
                            registerEvent(this$1, event);
                        }

                    });
                }
            };

            UIkit.prototype._unbindEvents = function () {
                this._events.forEach(function (unbind) { return unbind(); });
                delete this._events;
            };

            UIkit.prototype._initObserver = function () {
                var this$1 = this;


                var ref = this.$options;
                var attrs = ref.attrs;
                var props = ref.props;
                var el = ref.el;
                if (this._observer || !props || attrs === false) {
                    return;
                }

                attrs = isArray(attrs) ? attrs : Object.keys(props);

                this._observer = new MutationObserver(function () {

                    var data = getProps(this$1.$options, this$1.$name);
                    if (attrs.some(function (key) { return !isUndefined(data[key]) && data[key] !== this$1.$props[key]; })) {
                        this$1.$reset();
                    }

                });

                var filter = attrs.map(function (key) { return hyphenate(key); }).concat(this.$name);

                this._observer.observe(el, {
                    attributes: true,
                    attributeFilter: filter.concat(filter.map(function (key) { return ("data-" + key); }))
                });
            };

            function getProps(opts, name) {

                var data$1 = {};
                var args = opts.args; if ( args === void 0 ) args = [];
                var props = opts.props; if ( props === void 0 ) props = {};
                var el = opts.el;

                if (!props) {
                    return data$1;
                }

                for (var key in props) {
                    var prop = hyphenate(key);
                    var value = data(el, prop);

                    if (!isUndefined(value)) {

                        value = props[key] === Boolean && value === ''
                            ? true
                            : coerce(props[key], value);

                        if (prop === 'target' && (!value || startsWith(value, '_'))) {
                            continue;
                        }

                        data$1[key] = value;
                    }
                }

                var options = parseOptions(data(el, name), args);

                for (var key$1 in options) {
                    var prop$1 = camelize(key$1);
                    if (props[prop$1] !== undefined) {
                        data$1[prop$1] = coerce(props[prop$1], options[key$1]);
                    }
                }

                return data$1;
            }

            function registerComputed(component, key, cb) {
                Object.defineProperty(component, key, {

                    enumerable: true,

                    get: function() {

                        var _computeds = component._computeds;
                        var $props = component.$props;
                        var $el = component.$el;

                        if (!hasOwn(_computeds, key)) {
                            _computeds[key] = (cb.get || cb).call(component, $props, $el);
                        }

                        return _computeds[key];
                    },

                    set: function(value) {

                        var _computeds = component._computeds;

                        _computeds[key] = cb.set ? cb.set.call(component, value) : value;

                        if (isUndefined(_computeds[key])) {
                            delete _computeds[key];
                        }
                    }

                });
            }

            function registerEvent(component, event, key) {

                if (!isPlainObject(event)) {
                    event = ({name: key, handler: event});
                }

                var name = event.name;
                var el = event.el;
                var handler = event.handler;
                var capture = event.capture;
                var passive = event.passive;
                var delegate = event.delegate;
                var filter = event.filter;
                var self = event.self;
                el = isFunction(el)
                    ? el.call(component)
                    : el || component.$el;

                if (isArray(el)) {
                    el.forEach(function (el) { return registerEvent(component, assign({}, event, {el: el}), key); });
                    return;
                }

                if (!el || filter && !filter.call(component)) {
                    return;
                }

                component._events.push(
                    on(
                        el,
                        name,
                        !delegate
                            ? null
                            : isString(delegate)
                                ? delegate
                                : delegate.call(component),
                        isString(handler) ? component[handler] : handler.bind(component),
                        {passive: passive, capture: capture, self: self}
                    )
                );

            }

            function notIn(options, key) {
                return options.every(function (arr) { return !arr || !hasOwn(arr, key); });
            }

            function coerce(type, value) {

                if (type === Boolean) {
                    return toBoolean(value);
                } else if (type === Number) {
                    return toNumber(value);
                } else if (type === 'list') {
                    return toList(value);
                }

                return type ? type(value) : value;
            }

            function normalizeData(ref, ref$1) {
                var data = ref.data;
                var el = ref.el;
                var args = ref$1.args;
                var props = ref$1.props; if ( props === void 0 ) props = {};

                data = isArray(data)
                    ? !isEmpty(args)
                        ? data.slice(0, args.length).reduce(function (data, value, index) {
                            if (isPlainObject(value)) {
                                assign(data, value);
                            } else {
                                data[args[index]] = value;
                            }
                            return data;
                        }, {})
                        : undefined
                    : data;

                if (data) {
                    for (var key in data) {
                        if (isUndefined(data[key])) {
                            delete data[key];
                        } else {
                            data[key] = props[key] ? coerce(props[key], data[key]) : data[key];
                        }
                    }
                }

                return data;
            }
        }

        function instanceAPI (UIkit) {

            var DATA = UIkit.data;

            UIkit.prototype.$create = function (component, element, data) {
                return UIkit[component](element, data);
            };

            UIkit.prototype.$mount = function (el) {

                var ref = this.$options;
                var name = ref.name;

                if (!el[DATA]) {
                    el[DATA] = {};
                }

                if (el[DATA][name]) {
                    return;
                }

                el[DATA][name] = this;

                this.$el = this.$options.el = this.$options.el || el;

                if (within(el, document)) {
                    this._callConnected();
                }
            };

            UIkit.prototype.$reset = function () {
                this._callDisconnected();
                this._callConnected();
            };

            UIkit.prototype.$destroy = function (removeEl) {
                if ( removeEl === void 0 ) removeEl = false;


                var ref = this.$options;
                var el = ref.el;
                var name = ref.name;

                if (el) {
                    this._callDisconnected();
                }

                this._callHook('destroy');

                if (!el || !el[DATA]) {
                    return;
                }

                delete el[DATA][name];

                if (!isEmpty(el[DATA])) {
                    delete el[DATA];
                }

                if (removeEl) {
                    remove(this.$el);
                }
            };

            UIkit.prototype.$emit = function (e) {
                this._callUpdate(e);
            };

            UIkit.prototype.$update = function (element, e) {
                if ( element === void 0 ) element = this.$el;

                UIkit.update(element, e);
            };

            UIkit.prototype.$getComponent = UIkit.getComponent;

            var names = {};
            Object.defineProperties(UIkit.prototype, {

                $container: Object.getOwnPropertyDescriptor(UIkit, 'container'),

                $name: {

                    get: function() {
                        var ref = this.$options;
                        var name = ref.name;

                        if (!names[name]) {
                            names[name] = UIkit.prefix + hyphenate(name);
                        }

                        return names[name];
                    }

                }

            });

        }

        function componentAPI (UIkit) {

            var DATA = UIkit.data;

            var components = {};

            UIkit.component = function (name, options) {

                var id = hyphenate(name);

                name = camelize(id);

                if (!options) {

                    if (isPlainObject(components[name])) {
                        components[name] = UIkit.extend(components[name]);
                    }

                    return components[name];

                }

                UIkit[name] = function (element, data) {
                    var i = arguments.length, argsArray = Array(i);
                    while ( i-- ) argsArray[i] = arguments[i];


                    var component = UIkit.component(name);

                    return component.options.functional
                        ? new component({data: isPlainObject(element) ? element : [].concat( argsArray )})
                        : !element ? init(element) : $$(element).map(init)[0];

                    function init(element) {

                        var instance = UIkit.getComponent(element, name);

                        if (instance) {
                            if (!data) {
                                return instance;
                            } else {
                                instance.$destroy();
                            }
                        }

                        return new component({el: element, data: data});

                    }

                };

                var opt = isPlainObject(options) ? assign({}, options) : options.options;

                opt.name = name;

                if (opt.install) {
                    opt.install(UIkit, opt, name);
                }

                if (UIkit._initialized && !opt.functional) {
                    fastdom.read(function () { return UIkit[name](("[uk-" + id + "],[data-uk-" + id + "]")); });
                }

                return components[name] = isPlainObject(options) ? opt : options;
            };

            UIkit.getComponents = function (element) { return element && element[DATA] || {}; };
            UIkit.getComponent = function (element, name) { return UIkit.getComponents(element)[name]; };

            UIkit.connect = function (node) {

                if (node[DATA]) {
                    for (var name in node[DATA]) {
                        node[DATA][name]._callConnected();
                    }
                }

                for (var i = 0; i < node.attributes.length; i++) {

                    var name$1 = getComponentName(node.attributes[i].name);

                    if (name$1 && name$1 in components) {
                        UIkit[name$1](node);
                    }

                }

            };

            UIkit.disconnect = function (node) {
                for (var name in node[DATA]) {
                    node[DATA][name]._callDisconnected();
                }
            };

        }

        function getComponentName(attribute) {
            return startsWith(attribute, 'uk-') || startsWith(attribute, 'data-uk-')
                ? camelize(attribute.replace('data-uk-', '').replace('uk-', ''))
                : false;
        }

        var UIkit = function (options) {
            this._init(options);
        };

        UIkit.util = util;
        UIkit.data = '__uikit__';
        UIkit.prefix = 'uk-';
        UIkit.options = {};
        UIkit.version = '3.4.2';

        globalAPI(UIkit);
        hooksAPI(UIkit);
        stateAPI(UIkit);
        componentAPI(UIkit);
        instanceAPI(UIkit);

        function Core (UIkit) {

            ready(function () {

                UIkit.update();
                on(window, 'load resize', function () { return UIkit.update(null, 'resize'); });
                on(document, 'loadedmetadata load', function (ref) {
                    var target = ref.target;

                    return UIkit.update(target, 'resize');
                }, true);

                // throttle `scroll` event (Safari triggers multiple `scroll` events per frame)
                var pending;
                on(window, 'scroll', function (e) {

                    if (pending) {
                        return;
                    }
                    pending = true;
                    fastdom.write(function () { return pending = false; });

                    UIkit.update(null, e.type);

                }, {passive: true, capture: true});

                var started = 0;
                on(document, 'animationstart', function (ref) {
                    var target = ref.target;

                    if ((css(target, 'animationName') || '').match(/^uk-.*(left|right)/)) {

                        started++;
                        css(document.body, 'overflowX', 'hidden');
                        setTimeout(function () {
                            if (!--started) {
                                css(document.body, 'overflowX', '');
                            }
                        }, toMs(css(target, 'animationDuration')) + 100);
                    }
                }, true);

                var off;
                on(document, pointerDown, function (e) {

                    off && off();

                    if (!isTouch(e)) {
                        return;
                    }

                    // Handle Swipe Gesture
                    var pos = getEventPos(e);
                    var target = 'tagName' in e.target ? e.target : e.target.parentNode;
                    off = once(document, (pointerUp + " " + pointerCancel), function (e) {

                        var ref = getEventPos(e);
                        var x = ref.x;
                        var y = ref.y;

                        // swipe
                        if (target && x && Math.abs(pos.x - x) > 100 || y && Math.abs(pos.y - y) > 100) {

                            setTimeout(function () {
                                trigger(target, 'swipe');
                                trigger(target, ("swipe" + (swipeDirection(pos.x, pos.y, x, y))));
                            });

                        }

                    });

                }, {passive: true});

            });

        }

        function swipeDirection(x1, y1, x2, y2) {
            return Math.abs(x1 - x2) >= Math.abs(y1 - y2)
                ? x1 - x2 > 0
                    ? 'Left'
                    : 'Right'
                : y1 - y2 > 0
                    ? 'Up'
                    : 'Down';
        }

        function boot (UIkit) {

            var connect = UIkit.connect;
            var disconnect = UIkit.disconnect;

            if (!('MutationObserver' in window)) {
                return;
            }

            fastdom.read(init);

            function init() {

                if (document.body) {
                    apply(document.body, connect);
                }

                (new MutationObserver(function (mutations) {
                    var updates = [];
                    mutations.forEach(function (mutation) { return applyMutation(mutation, updates); });
                    updates.forEach(function (el) { return UIkit.update(el); });
                })).observe(document, {
                    childList: true,
                    subtree: true,
                    characterData: true,
                    attributes: true
                });

                UIkit._initialized = true;
            }

            function applyMutation(mutation, updates) {

                var target = mutation.target;
                var type = mutation.type;

                var update = type !== 'attributes'
                    ? applyChildList(mutation)
                    : applyAttribute(mutation);

                if (update && !updates.some(function (element) { return element.contains(target); })) {
                    updates.push(target.contains ? target : target.parentNode); // IE 11 text node does not implement contains
                }

            }

            function applyAttribute(ref) {
                var target = ref.target;
                var attributeName = ref.attributeName;


                if (attributeName === 'href') {
                    return true;
                }

                var name = getComponentName(attributeName);

                if (!name || !(name in UIkit)) {
                    return;
                }

                if (hasAttr(target, attributeName)) {
                    UIkit[name](target);
                    return true;
                }

                var component = UIkit.getComponent(target, name);

                if (component) {
                    component.$destroy();
                    return true;
                }

            }

            function applyChildList(ref) {
                var addedNodes = ref.addedNodes;
                var removedNodes = ref.removedNodes;


                for (var i = 0; i < addedNodes.length; i++) {
                    apply(addedNodes[i], connect);
                }

                for (var i$1 = 0; i$1 < removedNodes.length; i$1++) {
                    apply(removedNodes[i$1], disconnect);
                }

                return true;
            }

        }

        var Class = {

            connected: function() {
                !hasClass(this.$el, this.$name) && addClass(this.$el, this.$name);
            }

        };

        var Togglable = {

            props: {
                cls: Boolean,
                animation: 'list',
                duration: Number,
                origin: String,
                transition: String,
                queued: Boolean
            },

            data: {
                cls: false,
                animation: [false],
                duration: 200,
                origin: false,
                transition: 'linear',
                queued: false,

                initProps: {
                    overflow: '',
                    height: '',
                    paddingTop: '',
                    paddingBottom: '',
                    marginTop: '',
                    marginBottom: ''
                },

                hideProps: {
                    overflow: 'hidden',
                    height: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    marginTop: 0,
                    marginBottom: 0
                }

            },

            computed: {

                hasAnimation: function(ref) {
                    var animation = ref.animation;

                    return !!animation[0];
                },

                hasTransition: function(ref) {
                    var animation = ref.animation;

                    return this.hasAnimation && animation[0] === true;
                }

            },

            methods: {

                toggleElement: function(targets, show, animate) {
                    var this$1 = this;

                    return new Promise(function (resolve) {

                        targets = toNodes(targets);

                        var all = function (targets) { return Promise.all(targets.map(function (el) { return this$1._toggleElement(el, show, animate); })); };

                        var p;

                        if (!this$1.queued || !isUndefined(show) || !this$1.hasAnimation || targets.length < 2) {

                            p = all(targets);

                        } else {

                            var toggled = targets.filter(function (el) { return this$1.isToggled(el); });
                            var untoggled = targets.filter(function (el) { return !includes(toggled, el); });
                            var body = document.body;
                            var scroll = body.scrollTop;
                            var el = toggled[0];
                            var inProgress = Animation.inProgress(el) && hasClass(el, 'uk-animation-leave')
                                    || Transition.inProgress(el) && el.style.height === '0px';

                            p = all(toggled);

                            if (!inProgress) {
                                p = p.then(function () {
                                    var p = all(untoggled);
                                    body.scrollTop = scroll;
                                    return p;
                                });
                            }

                        }

                        p.then(resolve, noop);

                    });
                },

                isToggled: function(el) {
                    var nodes = toNodes(el || this.$el);
                    return this.cls
                        ? hasClass(nodes, this.cls.split(' ')[0])
                        : !hasAttr(nodes, 'hidden');
                },

                updateAria: function(el) {
                    if (this.cls === false) {
                        attr(el, 'aria-hidden', !this.isToggled(el));
                    }
                },

                _toggleElement: function(el, show, animate) {
                    var this$1 = this;


                    show = isBoolean(show)
                        ? show
                        : Animation.inProgress(el)
                            ? hasClass(el, 'uk-animation-leave')
                            : Transition.inProgress(el)
                                ? el.style.height === '0px'
                                : !this.isToggled(el);

                    if (!trigger(el, ("before" + (show ? 'show' : 'hide')), [this])) {
                        return Promise.reject();
                    }

                    var promise = (
                        isFunction(animate)
                            ? animate
                            : animate === false || !this.hasAnimation
                                ? this._toggle
                                : this.hasTransition
                                    ? toggleHeight(this)
                                    : toggleAnimation(this)
                    )(el, show);

                    trigger(el, show ? 'show' : 'hide', [this]);

                    var final = function () {
                        trigger(el, show ? 'shown' : 'hidden', [this$1]);
                        this$1.$update(el);
                    };

                    return promise ? promise.then(final) : Promise.resolve(final());
                },

                _toggle: function(el, toggled) {

                    if (!el) {
                        return;
                    }

                    toggled = Boolean(toggled);

                    var changed;
                    if (this.cls) {
                        changed = includes(this.cls, ' ') || toggled !== hasClass(el, this.cls);
                        changed && toggleClass(el, this.cls, includes(this.cls, ' ') ? undefined : toggled);
                    } else {
                        changed = toggled === hasAttr(el, 'hidden');
                        changed && attr(el, 'hidden', !toggled ? '' : null);
                    }

                    $$('[autofocus]', el).some(function (el) { return isVisible(el) ? el.focus() || true : el.blur(); });

                    this.updateAria(el);

                    if (changed) {
                        trigger(el, 'toggled', [this]);
                        this.$update(el);
                    }
                }

            }

        };

        function toggleHeight(ref) {
            var isToggled = ref.isToggled;
            var duration = ref.duration;
            var initProps = ref.initProps;
            var hideProps = ref.hideProps;
            var transition = ref.transition;
            var _toggle = ref._toggle;

            return function (el, show) {

                var inProgress = Transition.inProgress(el);
                var inner = el.hasChildNodes ? toFloat(css(el.firstElementChild, 'marginTop')) + toFloat(css(el.lastElementChild, 'marginBottom')) : 0;
                var currentHeight = isVisible(el) ? height(el) + (inProgress ? 0 : inner) : 0;

                Transition.cancel(el);

                if (!isToggled(el)) {
                    _toggle(el, true);
                }

                height(el, '');

                // Update child components first
                fastdom.flush();

                var endHeight = height(el) + (inProgress ? 0 : inner);
                height(el, currentHeight);

                return (show
                        ? Transition.start(el, assign({}, initProps, {overflow: 'hidden', height: endHeight}), Math.round(duration * (1 - currentHeight / endHeight)), transition)
                        : Transition.start(el, hideProps, Math.round(duration * (currentHeight / endHeight)), transition).then(function () { return _toggle(el, false); })
                ).then(function () { return css(el, initProps); });

            };
        }

        function toggleAnimation(cmp) {
            return function (el, show) {

                Animation.cancel(el);

                var animation = cmp.animation;
                var duration = cmp.duration;
                var _toggle = cmp._toggle;

                if (show) {
                    _toggle(el, true);
                    return Animation.in(el, animation[0], duration, cmp.origin);
                }

                return Animation.out(el, animation[1] || animation[0], duration, cmp.origin).then(function () { return _toggle(el, false); });
            };
        }

        var Accordion = {

            mixins: [Class, Togglable],

            props: {
                targets: String,
                active: null,
                collapsible: Boolean,
                multiple: Boolean,
                toggle: String,
                content: String,
                transition: String,
                offset: Number
            },

            data: {
                targets: '> *',
                active: false,
                animation: [true],
                collapsible: true,
                multiple: false,
                clsOpen: 'uk-open',
                toggle: '> .uk-accordion-title',
                content: '> .uk-accordion-content',
                transition: 'ease',
                offset: 0
            },

            computed: {

                items: {

                    get: function(ref, $el) {
                        var targets = ref.targets;

                        return $$(targets, $el);
                    },

                    watch: function(items, prev) {
                        var this$1 = this;


                        items.forEach(function (el) { return hide($(this$1.content, el), !hasClass(el, this$1.clsOpen)); });

                        if (prev || hasClass(items, this.clsOpen)) {
                            return;
                        }

                        var active = this.active !== false && items[Number(this.active)]
                            || !this.collapsible && items[0];

                        if (active) {
                            this.toggle(active, false);
                        }

                    },

                    immediate: true

                }

            },

            events: [

                {

                    name: 'click',

                    delegate: function() {
                        return ((this.targets) + " " + (this.$props.toggle));
                    },

                    handler: function(e) {
                        e.preventDefault();
                        this.toggle(index($$(((this.targets) + " " + (this.$props.toggle)), this.$el), e.current));
                    }

                }

            ],

            methods: {

                toggle: function(item, animate) {
                    var this$1 = this;


                    var items = [this.items[getIndex(item, this.items)]];
                    var activeItems = filter(this.items, ("." + (this.clsOpen)));

                    if (!this.multiple && !includes(activeItems, items[0])) {
                        items = items.concat(activeItems);
                    }

                    if (!this.collapsible && !filter(items, (":not(." + (this.clsOpen) + ")")).length) {
                        return;
                    }

                    items.forEach(function (el) { return this$1.toggleElement(el, !hasClass(el, this$1.clsOpen), function (el, show) {

                        toggleClass(el, this$1.clsOpen, show);

                        var content = $(("" + (el._wrapper ? '> * ' : '') + (this$1.content)), el);

                        if (animate === false || !this$1.hasTransition) {
                            hide(content, !show);
                            return;
                        }

                        if (!el._wrapper) {
                            el._wrapper = wrapAll(content, ("<div" + (show ? ' hidden' : '') + ">"));
                        }

                        hide(content, false);
                        return toggleHeight(this$1)(el._wrapper, show).then(function () {
                            hide(content, !show);
                            delete el._wrapper;
                            unwrap(content);

                            if (show) {
                                var toggle = $(this$1.$props.toggle, el);
                                if (!isInView(toggle)) {
                                    scrollIntoView(toggle, {offset: this$1.offset});
                                }
                            }
                        });
                    }); });
                }

            }

        };

        function hide(el, hide) {
            attr(el, 'hidden', hide ? '' : null);
        }

        var alert = {

            mixins: [Class, Togglable],

            args: 'animation',

            props: {
                close: String
            },

            data: {
                animation: [true],
                selClose: '.uk-alert-close',
                duration: 150,
                hideProps: assign({opacity: 0}, Togglable.data.hideProps)
            },

            events: [

                {

                    name: 'click',

                    delegate: function() {
                        return this.selClose;
                    },

                    handler: function(e) {
                        e.preventDefault();
                        this.close();
                    }

                }

            ],

            methods: {

                close: function() {
                    var this$1 = this;

                    this.toggleElement(this.$el).then(function () { return this$1.$destroy(true); });
                }

            }

        };

        var Video = {

            args: 'autoplay',

            props: {
                automute: Boolean,
                autoplay: Boolean
            },

            data: {
                automute: false,
                autoplay: true
            },

            computed: {

                inView: function(ref) {
                    var autoplay = ref.autoplay;

                    return autoplay === 'inview';
                }

            },

            connected: function() {

                if (this.inView && !hasAttr(this.$el, 'preload')) {
                    this.$el.preload = 'none';
                }

                this.player = new Player(this.$el);

                if (this.automute) {
                    this.player.mute();
                }

            },

            update: {

                read: function() {

                    return !this.player
                        ? false
                        : {
                            visible: isVisible(this.$el) && css(this.$el, 'visibility') !== 'hidden',
                            inView: this.inView && isInView(this.$el)
                        };
                },

                write: function(ref) {
                    var visible = ref.visible;
                    var inView = ref.inView;


                    if (!visible || this.inView && !inView) {
                        this.player.pause();
                    } else if (this.autoplay === true || this.inView && inView) {
                        this.player.play();
                    }

                },

                events: ['resize', 'scroll']

            }

        };

        var cover = {

            mixins: [Class, Video],

            props: {
                width: Number,
                height: Number
            },

            data: {
                automute: true
            },

            update: {

                read: function() {

                    var el = this.$el;
                    var ref = getPositionedParent(el) || el.parentNode;
                    var height = ref.offsetHeight;
                    var width = ref.offsetWidth;
                    var dim = Dimensions.cover(
                        {
                            width: this.width || el.naturalWidth || el.videoWidth || el.clientWidth,
                            height: this.height || el.naturalHeight || el.videoHeight || el.clientHeight
                        },
                        {
                            width: width + (width % 2 ? 1 : 0),
                            height: height + (height % 2 ? 1 : 0)
                        }
                    );

                    if (!dim.width || !dim.height) {
                        return false;
                    }

                    return dim;
                },

                write: function(ref) {
                    var height = ref.height;
                    var width = ref.width;

                    css(this.$el, {height: height, width: width});
                },

                events: ['resize']

            }

        };

        function getPositionedParent(el) {
            while ((el = parent(el))) {
                if (css(el, 'position') !== 'static') {
                    return el;
                }
            }
        }

        var Position = {

            props: {
                pos: String,
                offset: null,
                flip: Boolean,
                clsPos: String
            },

            data: {
                pos: ("bottom-" + (!isRtl ? 'left' : 'right')),
                flip: true,
                offset: false,
                clsPos: ''
            },

            computed: {

                pos: function(ref) {
                    var pos = ref.pos;

                    return (pos + (!includes(pos, '-') ? '-center' : '')).split('-');
                },

                dir: function() {
                    return this.pos[0];
                },

                align: function() {
                    return this.pos[1];
                }

            },

            methods: {

                positionAt: function(element, target, boundary) {

                    removeClasses(element, ((this.clsPos) + "-(top|bottom|left|right)(-[a-z]+)?"));
                    css(element, {top: '', left: ''});

                    var node;
                    var ref = this;
                    var offset$1 = ref.offset;
                    var axis = this.getAxis();

                    if (!isNumeric(offset$1)) {
                        node = $(offset$1);
                        offset$1 = node
                            ? offset(node)[axis === 'x' ? 'left' : 'top'] - offset(target)[axis === 'x' ? 'right' : 'bottom']
                            : 0;
                    }

                    var ref$1 = positionAt(
                        element,
                        target,
                        axis === 'x' ? ((flipPosition(this.dir)) + " " + (this.align)) : ((this.align) + " " + (flipPosition(this.dir))),
                        axis === 'x' ? ((this.dir) + " " + (this.align)) : ((this.align) + " " + (this.dir)),
                        axis === 'x' ? ("" + (this.dir === 'left' ? -offset$1 : offset$1)) : (" " + (this.dir === 'top' ? -offset$1 : offset$1)),
                        null,
                        this.flip,
                        boundary
                    ).target;
                    var x = ref$1.x;
                    var y = ref$1.y;

                    this.dir = axis === 'x' ? x : y;
                    this.align = axis === 'x' ? y : x;

                    toggleClass(element, ((this.clsPos) + "-" + (this.dir) + "-" + (this.align)), this.offset === false);

                },

                getAxis: function() {
                    return this.dir === 'top' || this.dir === 'bottom' ? 'y' : 'x';
                }

            }

        };

        var active;

        var drop = {

            mixins: [Position, Togglable],

            args: 'pos',

            props: {
                mode: 'list',
                toggle: Boolean,
                boundary: Boolean,
                boundaryAlign: Boolean,
                delayShow: Number,
                delayHide: Number,
                clsDrop: String
            },

            data: {
                mode: ['click', 'hover'],
                toggle: '- *',
                boundary: window,
                boundaryAlign: false,
                delayShow: 0,
                delayHide: 800,
                clsDrop: false,
                animation: ['uk-animation-fade'],
                cls: 'uk-open'
            },

            computed: {

                boundary: function(ref, $el) {
                    var boundary = ref.boundary;

                    return query(boundary, $el);
                },

                clsDrop: function(ref) {
                    var clsDrop = ref.clsDrop;

                    return clsDrop || ("uk-" + (this.$options.name));
                },

                clsPos: function() {
                    return this.clsDrop;
                }

            },

            created: function() {
                this.tracker = new MouseTracker();
            },

            connected: function() {

                addClass(this.$el, this.clsDrop);

                var ref = this.$props;
                var toggle = ref.toggle;
                this.toggle = toggle && this.$create('toggle', query(toggle, this.$el), {
                    target: this.$el,
                    mode: this.mode
                });

                !this.toggle && trigger(this.$el, 'updatearia');

            },

            disconnected: function() {
                if (this.isActive()) {
                    active = null;
                }
            },

            events: [

                {

                    name: 'click',

                    delegate: function() {
                        return ("." + (this.clsDrop) + "-close");
                    },

                    handler: function(e) {
                        e.preventDefault();
                        this.hide(false);
                    }

                },

                {

                    name: 'click',

                    delegate: function() {
                        return 'a[href^="#"]';
                    },

                    handler: function(ref) {
                        var defaultPrevented = ref.defaultPrevented;
                        var hash = ref.current.hash;

                        if (!defaultPrevented && hash && !within(hash, this.$el)) {
                            this.hide(false);
                        }
                    }

                },

                {

                    name: 'beforescroll',

                    handler: function() {
                        this.hide(false);
                    }

                },

                {

                    name: 'toggle',

                    self: true,

                    handler: function(e, toggle) {

                        e.preventDefault();

                        if (this.isToggled()) {
                            this.hide(false);
                        } else {
                            this.show(toggle, false);
                        }
                    }

                },

                {

                    name: 'toggleshow',

                    self: true,

                    handler: function(e, toggle) {
                        e.preventDefault();
                        this.show(toggle);
                    }

                },

                {

                    name: 'togglehide',

                    self: true,

                    handler: function(e) {
                        e.preventDefault();
                        this.hide();
                    }

                },

                {

                    name: pointerEnter,

                    filter: function() {
                        return includes(this.mode, 'hover');
                    },

                    handler: function(e) {
                        if (!isTouch(e)) {
                            this.clearTimers();
                        }
                    }

                },

                {

                    name: pointerLeave,

                    filter: function() {
                        return includes(this.mode, 'hover');
                    },

                    handler: function(e) {
                        if (!isTouch(e)) {
                            this.hide();
                        }
                    }

                },

                {

                    name: 'toggled',

                    self: true,

                    handler: function() {

                        if (!this.isToggled()) {
                            return;
                        }

                        this.clearTimers();
                        Animation.cancel(this.$el);
                        this.position();
                    }

                },

                {

                    name: 'show',

                    self: true,

                    handler: function() {
                        var this$1 = this;


                        active = this;

                        this.tracker.init();
                        trigger(this.$el, 'updatearia');

                        once(this.$el, 'hide', on(document, pointerDown, function (ref) {
                                var target = ref.target;

                                return !within(target, this$1.$el) && once(document, (pointerUp + " " + pointerCancel + " scroll"), function (ref) {
                                var defaultPrevented = ref.defaultPrevented;
                                var type = ref.type;
                                var newTarget = ref.target;

                                if (!defaultPrevented && type === pointerUp && target === newTarget && !(this$1.toggle && within(target, this$1.toggle.$el))) {
                                    this$1.hide(false);
                                }
                            }, true);
                        }
                        ), {self: true});

                        once(this.$el, 'hide', on(document, 'keydown', function (e) {
                            if (e.keyCode === 27) {
                                e.preventDefault();
                                this$1.hide(false);
                            }
                        }), {self: true});

                    }

                },

                {

                    name: 'beforehide',

                    self: true,

                    handler: function() {
                        this.clearTimers();
                    }

                },

                {

                    name: 'hide',

                    handler: function(ref) {
                        var target = ref.target;


                        if (this.$el !== target) {
                            active = active === null && within(target, this.$el) && this.isToggled() ? this : active;
                            return;
                        }

                        active = this.isActive() ? null : active;
                        trigger(this.$el, 'updatearia');
                        this.tracker.cancel();
                    }

                },

                {

                    name: 'updatearia',

                    self: true,

                    handler: function(e, toggle) {

                        e.preventDefault();

                        this.updateAria(this.$el);

                        if (toggle || this.toggle) {
                            attr((toggle || this.toggle).$el, 'aria-expanded', this.isToggled());
                            toggleClass(this.toggle.$el, this.cls, this.isToggled());
                        }
                    }
                }

            ],

            update: {

                write: function() {

                    if (this.isToggled() && !Animation.inProgress(this.$el)) {
                        this.position();
                    }

                },

                events: ['resize']

            },

            methods: {

                show: function(toggle, delay) {
                    var this$1 = this;
                    if ( toggle === void 0 ) toggle = this.toggle;
                    if ( delay === void 0 ) delay = true;


                    if (this.isToggled() && toggle && this.toggle && toggle.$el !== this.toggle.$el) {
                        this.hide(false);
                    }

                    this.toggle = toggle;

                    this.clearTimers();

                    if (this.isActive()) {
                        return;
                    }

                    if (active) {

                        if (delay && active.isDelaying) {
                            this.showTimer = setTimeout(this.show, 10);
                            return;
                        }

                        while (active && !within(this.$el, active.$el)) {
                            active.hide(false);
                        }
                    }

                    this.showTimer = setTimeout(function () { return !this$1.isToggled() && this$1.toggleElement(this$1.$el, true); }, delay && this.delayShow || 0);

                },

                hide: function(delay) {
                    var this$1 = this;
                    if ( delay === void 0 ) delay = true;


                    var hide = function () { return this$1.toggleElement(this$1.$el, false, false); };

                    this.clearTimers();

                    this.isDelaying = getPositionedElements(this.$el).some(function (el) { return this$1.tracker.movesTo(el); });

                    if (delay && this.isDelaying) {
                        this.hideTimer = setTimeout(this.hide, 50);
                    } else if (delay && this.delayHide) {
                        this.hideTimer = setTimeout(hide, this.delayHide);
                    } else {
                        hide();
                    }
                },

                clearTimers: function() {
                    clearTimeout(this.showTimer);
                    clearTimeout(this.hideTimer);
                    this.showTimer = null;
                    this.hideTimer = null;
                    this.isDelaying = false;
                },

                isActive: function() {
                    return active === this;
                },

                position: function() {

                    removeClasses(this.$el, ((this.clsDrop) + "-(stack|boundary)"));
                    toggleClass(this.$el, ((this.clsDrop) + "-boundary"), this.boundaryAlign);

                    var boundary = offset(this.boundary);
                    var alignTo = this.boundaryAlign ? boundary : offset(this.toggle.$el);

                    if (this.align === 'justify') {
                        var prop = this.getAxis() === 'y' ? 'width' : 'height';
                        css(this.$el, prop, alignTo[prop]);
                    } else if (this.$el.offsetWidth > Math.max(boundary.right - alignTo.left, alignTo.right - boundary.left)) {
                        addClass(this.$el, ((this.clsDrop) + "-stack"));
                    }

                    this.positionAt(this.$el, this.boundaryAlign ? this.boundary : this.toggle.$el, this.boundary);

                }

            }

        };

        function getPositionedElements(el) {
            var result = [];
            apply(el, function (el) { return css(el, 'position') !== 'static' && result.push(el); });
            return result;
        }

        var formCustom = {

            mixins: [Class],

            args: 'target',

            props: {
                target: Boolean
            },

            data: {
                target: false
            },

            computed: {

                input: function(_, $el) {
                    return $(selInput, $el);
                },

                state: function() {
                    return this.input.nextElementSibling;
                },

                target: function(ref, $el) {
                    var target = ref.target;

                    return target && (target === true
                        && this.input.parentNode === $el
                        && this.input.nextElementSibling
                        || query(target, $el));
                }

            },

            update: function() {

                var ref = this;
                var target = ref.target;
                var input = ref.input;

                if (!target) {
                    return;
                }

                var option;
                var prop = isInput(target) ? 'value' : 'textContent';
                var prev = target[prop];
                var value = input.files && input.files[0]
                    ? input.files[0].name
                    : matches(input, 'select') && (option = $$('option', input).filter(function (el) { return el.selected; })[0]) // eslint-disable-line prefer-destructuring
                        ? option.textContent
                        : input.value;

                if (prev !== value) {
                    target[prop] = value;
                }

            },

            events: [

                {
                    name: 'change',

                    handler: function() {
                        this.$update();
                    }
                },

                {
                    name: 'reset',

                    el: function() {
                        return closest(this.$el, 'form');
                    },

                    handler: function() {
                        this.$update();
                    }
                }

            ]

        };

        // Deprecated
        var gif = {

            update: {

                read: function(data) {

                    var inview = isInView(this.$el);

                    if (!inview || data.isInView === inview) {
                        return false;
                    }

                    data.isInView = inview;
                },

                write: function() {
                    this.$el.src = this.$el.src; // eslint-disable-line no-self-assign
                },

                events: ['scroll', 'resize']
            }

        };

        var Margin = {

            props: {
                margin: String,
                firstColumn: Boolean
            },

            data: {
                margin: 'uk-margin-small-top',
                firstColumn: 'uk-first-column'
            },

            update: {

                read: function() {
                    return {rows: getRows(this.$el.children)};
                },

                write: function(ref) {
                    var this$1 = this;
                    var rows = ref.rows;


                    rows.forEach(function (row, i) { return row.forEach(function (el, j) {
                            toggleClass(el, this$1.margin, i !== 0);
                            toggleClass(el, this$1.firstColumn, j === 0);
                        }); }
                    );

                },

                events: ['resize']

            }

        };

        function getRows(items) {

            var rows = [[]];

            for (var i = 0; i < items.length; i++) {

                var el = items[i];

                if (!isVisible(el)) {
                    continue;
                }

                var dim = getOffset(el);

                for (var j = rows.length - 1; j >= 0; j--) {

                    var row = rows[j];

                    if (!row[0]) {
                        row.push(el);
                        break;
                    }

                    var leftDim = (void 0);
                    if (row[0].offsetParent === el.offsetParent) {
                        leftDim = getOffset(row[0]);
                    } else {
                        dim = getOffset(el, true);
                        leftDim = getOffset(row[0], true);
                    }

                    if (dim.top >= leftDim.bottom - 1 && dim.top !== leftDim.top) {
                        rows.push([el]);
                        break;
                    }

                    if (dim.bottom > leftDim.top || dim.top === leftDim.top) {

                        if (dim.left < leftDim.left && !isRtl) {
                            row.unshift(el);
                            break;
                        }

                        row.push(el);
                        break;
                    }

                    if (j === 0) {
                        rows.unshift([el]);
                        break;
                    }

                }

            }

            return rows;

        }

        function getOffset(element, offset) {
            var assign;

            if ( offset === void 0 ) offset = false;

            var offsetTop = element.offsetTop;
            var offsetLeft = element.offsetLeft;
            var offsetHeight = element.offsetHeight;

            if (offset) {
                (assign = offsetPosition(element), offsetTop = assign[0], offsetLeft = assign[1]);
            }

            return {
                top: offsetTop,
                left: offsetLeft,
                height: offsetHeight,
                bottom: offsetTop + offsetHeight
            };
        }

        var grid = {

            extends: Margin,

            mixins: [Class],

            name: 'grid',

            props: {
                masonry: Boolean,
                parallax: Number
            },

            data: {
                margin: 'uk-grid-margin',
                clsStack: 'uk-grid-stack',
                masonry: false,
                parallax: 0
            },

            computed: {

                length: function(_, $el) {
                    return $el.children.length;
                },

                parallax: function(ref) {
                    var parallax = ref.parallax;

                    return parallax && this.length ? Math.abs(parallax) : '';
                }

            },

            connected: function() {
                this.masonry && addClass(this.$el, 'uk-flex-top uk-flex-wrap-top');
            },

            update: [

                {

                    read: function(ref) {
                        var rows = ref.rows;

                        return {stacks: !rows.some(function (row) { return row.length > 1; })};
                    },

                    write: function(ref) {
                        var stacks = ref.stacks;

                        toggleClass(this.$el, this.clsStack, stacks);
                    },

                    events: ['resize']

                },

                {

                    read: function(ref) {
                        var rows = ref.rows;


                        if (!this.masonry && !this.parallax) {
                            return false;
                        }

                        rows = rows.map(function (elements) { return sortBy(elements, 'offsetLeft'); });

                        if (isRtl) {
                            rows.map(function (row) { return row.reverse(); });
                        }

                        var transitionInProgress = rows.some(function (elements) { return elements.some(Transition.inProgress); });
                        var translates = false;
                        var elHeight = '';

                        if (this.masonry && this.length) {

                            var height = 0;

                            translates = rows.reduce(function (translates, row, i) {

                                translates[i] = row.map(function (_, j) { return i === 0 ? 0 : toFloat(translates[i - 1][j]) + (height - toFloat(rows[i - 1][j] && rows[i - 1][j].offsetHeight)); });
                                height = row.reduce(function (height, el) { return Math.max(height, el.offsetHeight); }, 0);

                                return translates;

                            }, []);

                            elHeight = maxColumnHeight(rows) + getMarginTop(this.$el, this.margin) * (rows.length - 1);

                        }

                        var padding = this.parallax && getPaddingBottom(this.parallax, rows, translates);

                        return {padding: padding, rows: rows, translates: translates, height: !transitionInProgress ? elHeight : false};

                    },

                    write: function(ref) {
                        var height = ref.height;
                        var padding = ref.padding;


                        css(this.$el, 'paddingBottom', padding);
                        height !== false && css(this.$el, 'height', height);

                    },

                    events: ['resize']

                },

                {

                    read: function(ref) {
                        var height$1 = ref.height;

                        return {
                            scrolled: this.parallax
                                ? scrolledOver(this.$el, height$1 ? height$1 - height(this.$el) : 0) * this.parallax
                                : false
                        };
                    },

                    write: function(ref) {
                        var rows = ref.rows;
                        var scrolled = ref.scrolled;
                        var translates = ref.translates;


                        if (scrolled === false && !translates) {
                            return;
                        }

                        rows.forEach(function (row, i) { return row.forEach(function (el, j) { return css(el, 'transform', !scrolled && !translates ? '' : ("translateY(" + ((translates && -translates[i][j]) + (scrolled ? j % 2 ? scrolled : scrolled / 8 : 0)) + "px)")); }
                            ); }
                        );

                    },

                    events: ['scroll', 'resize']

                }

            ]

        };

        function getPaddingBottom(distance, rows, translates) {
            var column = 0;
            var max = 0;
            var maxScrolled = 0;
            for (var i = rows.length - 1; i >= 0; i--) {
                for (var j = column; j < rows[i].length; j++) {
                    var el = rows[i][j];
                    var bottom = el.offsetTop + height(el) + (translates && -translates[i][j]);
                    max = Math.max(max, bottom);
                    maxScrolled = Math.max(maxScrolled, bottom + (j % 2 ? distance : distance / 8));
                    column++;
                }
            }
            return maxScrolled - max;
        }

        function getMarginTop(root, cls) {

            var nodes = children(root);
            var ref = nodes.filter(function (el) { return hasClass(el, cls); });
            var node = ref[0];

            return toFloat(node
                ? css(node, 'marginTop')
                : css(nodes[0], 'paddingLeft'));
        }

        function maxColumnHeight(rows) {
            return Math.max.apply(Math, rows.reduce(function (sum, row) {
                row.forEach(function (el, i) { return sum[i] = (sum[i] || 0) + el.offsetHeight; });
                return sum;
            }, []));
        }

        // IE 11 fix (min-height on a flex container won't apply to its flex items)
        var FlexBug = isIE ? {

            props: {
                selMinHeight: String
            },

            data: {
                selMinHeight: false,
                forceHeight: false
            },

            computed: {

                elements: function(ref, $el) {
                    var selMinHeight = ref.selMinHeight;

                    return selMinHeight ? $$(selMinHeight, $el) : [$el];
                }

            },

            update: [

                {

                    read: function() {
                        css(this.elements, 'height', '');
                    },

                    order: -5,

                    events: ['resize']

                },

                {

                    write: function() {
                        var this$1 = this;

                        this.elements.forEach(function (el) {
                            var height = toFloat(css(el, 'minHeight'));
                            if (height && (this$1.forceHeight || Math.round(height + boxModelAdjust(el, 'height', 'content-box')) >= el.offsetHeight)) {
                                css(el, 'height', height);
                            }
                        });
                    },

                    order: 5,

                    events: ['resize']

                }

            ]

        } : {};

        var heightMatch = {

            mixins: [FlexBug],

            args: 'target',

            props: {
                target: String,
                row: Boolean
            },

            data: {
                target: '> *',
                row: true,
                forceHeight: true
            },

            computed: {

                elements: function(ref, $el) {
                    var target = ref.target;

                    return $$(target, $el);
                }

            },

            update: {

                read: function() {
                    return {
                        rows: (this.row ? getRows(this.elements) : [this.elements]).map(match)
                    };
                },

                write: function(ref) {
                    var rows = ref.rows;

                    rows.forEach(function (ref) {
                            var heights = ref.heights;
                            var elements = ref.elements;

                            return elements.forEach(function (el, i) { return css(el, 'minHeight', heights[i]); }
                        );
                    }
                    );
                },

                events: ['resize']

            }

        };

        function match(elements) {
            var assign;


            if (elements.length < 2) {
                return {heights: [''], elements: elements};
            }

            var ref = getHeights(elements);
            var heights = ref.heights;
            var max = ref.max;
            var hasMinHeight = elements.some(function (el) { return el.style.minHeight; });
            var hasShrunk = elements.some(function (el, i) { return !el.style.minHeight && heights[i] < max; });

            if (hasMinHeight && hasShrunk) {
                css(elements, 'minHeight', '');
                ((assign = getHeights(elements), heights = assign.heights, max = assign.max));
            }

            heights = elements.map(function (el, i) { return heights[i] === max && toFloat(el.style.minHeight).toFixed(2) !== max.toFixed(2) ? '' : max; }
            );

            return {heights: heights, elements: elements};
        }

        function getHeights(elements) {
            var heights = elements.map(function (el) { return offset(el).height - boxModelAdjust(el, 'height', 'content-box'); });
            var max = Math.max.apply(null, heights);

            return {heights: heights, max: max};
        }

        var heightViewport = {

            mixins: [FlexBug],

            props: {
                expand: Boolean,
                offsetTop: Boolean,
                offsetBottom: Boolean,
                minHeight: Number
            },

            data: {
                expand: false,
                offsetTop: false,
                offsetBottom: false,
                minHeight: 0
            },

            update: {

                read: function(ref) {
                    var prev = ref.minHeight;


                    if (!isVisible(this.$el)) {
                        return false;
                    }

                    var minHeight = '';
                    var box = boxModelAdjust(this.$el, 'height', 'content-box');

                    if (this.expand) {

                        this.$el.dataset.heightExpand = '';

                        if ($('[data-height-expand]') !== this.$el) {
                            return false;
                        }

                        minHeight = height(window) - (offsetHeight(document.documentElement) - offsetHeight(this.$el)) - box || '';

                    } else {

                        // on mobile devices (iOS and Android) window.innerHeight !== 100vh
                        minHeight = 'calc(100vh';

                        if (this.offsetTop) {

                            var ref$1 = offset(this.$el);
                            var top = ref$1.top;
                            minHeight += top > 0 && top < height(window) / 2 ? (" - " + top + "px") : '';

                        }

                        if (this.offsetBottom === true) {

                            minHeight += " - " + (offsetHeight(this.$el.nextElementSibling)) + "px";

                        } else if (isNumeric(this.offsetBottom)) {

                            minHeight += " - " + (this.offsetBottom) + "vh";

                        } else if (this.offsetBottom && endsWith(this.offsetBottom, 'px')) {

                            minHeight += " - " + (toFloat(this.offsetBottom)) + "px";

                        } else if (isString(this.offsetBottom)) {

                            minHeight += " - " + (offsetHeight(query(this.offsetBottom, this.$el))) + "px";

                        }

                        minHeight += (box ? (" - " + box + "px") : '') + ")";

                    }

                    return {minHeight: minHeight, prev: prev};
                },

                write: function(ref) {
                    var minHeight = ref.minHeight;
                    var prev = ref.prev;


                    css(this.$el, {minHeight: minHeight});

                    if (minHeight !== prev) {
                        this.$update(this.$el, 'resize');
                    }

                    if (this.minHeight && toFloat(css(this.$el, 'minHeight')) < this.minHeight) {
                        css(this.$el, 'minHeight', this.minHeight);
                    }

                },

                events: ['resize']

            }

        };

        function offsetHeight(el) {
            return el && offset(el).height || 0;
        }

        var SVG = {

            args: 'src',

            props: {
                id: Boolean,
                icon: String,
                src: String,
                style: String,
                width: Number,
                height: Number,
                ratio: Number,
                class: String,
                strokeAnimation: Boolean,
                focusable: Boolean, // IE 11
                attributes: 'list'
            },

            data: {
                ratio: 1,
                include: ['style', 'class', 'focusable'],
                class: '',
                strokeAnimation: false
            },

            beforeConnect: function() {
                var this$1 = this;
                var assign;


                this.class += ' uk-svg';

                if (!this.icon && includes(this.src, '#')) {

                    var parts = this.src.split('#');

                    if (parts.length > 1) {
                        (assign = parts, this.src = assign[0], this.icon = assign[1]);
                    }
                }

                this.svg = this.getSvg().then(function (el) {
                    this$1.applyAttributes(el);
                    return this$1.svgEl = insertSVG(el, this$1.$el);
                }, noop);

            },

            disconnected: function() {
                var this$1 = this;


                if (isVoidElement(this.$el)) {
                    attr(this.$el, 'hidden', null);
                }

                if (this.svg) {
                    this.svg.then(function (svg) { return (!this$1._connected || svg !== this$1.svgEl) && remove(svg); }, noop);
                }

                this.svg = this.svgEl = null;

            },

            update: {

                read: function() {
                    return !!(this.strokeAnimation && this.svgEl && isVisible(this.svgEl));
                },

                write: function() {
                    applyAnimation(this.svgEl);
                },

                type: ['resize']

            },

            methods: {

                getSvg: function() {
                    var this$1 = this;

                    return loadSVG(this.src).then(function (svg) { return parseSVG(svg, this$1.icon) || Promise.reject('SVG not found.'); }
                    );
                },

                applyAttributes: function(el) {
                    var this$1 = this;


                    for (var prop in this.$options.props) {
                        if (this[prop] && includes(this.include, prop)) {
                            attr(el, prop, this[prop]);
                        }
                    }

                    for (var attribute in this.attributes) {
                        var ref = this.attributes[attribute].split(':', 2);
                        var prop$1 = ref[0];
                        var value = ref[1];
                        attr(el, prop$1, value);
                    }

                    if (!this.id) {
                        removeAttr(el, 'id');
                    }

                    var props = ['width', 'height'];
                    var dimensions = [this.width, this.height];

                    if (!dimensions.some(function (val) { return val; })) {
                        dimensions = props.map(function (prop) { return attr(el, prop); });
                    }

                    var viewBox = attr(el, 'viewBox');
                    if (viewBox && !dimensions.some(function (val) { return val; })) {
                        dimensions = viewBox.split(' ').slice(2);
                    }

                    dimensions.forEach(function (val, i) {
                        val = (val | 0) * this$1.ratio;
                        val && attr(el, props[i], val);

                        if (val && !dimensions[i ^ 1]) {
                            removeAttr(el, props[i ^ 1]);
                        }
                    });

                    attr(el, 'data-svg', this.icon || this.src);

                }

            }

        };

        var svgs = {};

        function loadSVG(src) {

            if (svgs[src]) {
                return svgs[src];
            }

            return svgs[src] = new Promise(function (resolve, reject) {

                if (!src) {
                    reject();
                    return;
                }

                if (startsWith(src, 'data:')) {
                    resolve(decodeURIComponent(src.split(',')[1]));
                } else {

                    ajax(src).then(
                        function (xhr) { return resolve(xhr.response); },
                        function () { return reject('SVG not found.'); }
                    );

                }

            });
        }

        function parseSVG(svg, icon) {

            if (icon && includes(svg, '<symbol')) {
                svg = parseSymbols(svg, icon) || svg;
            }

            svg = $(svg.substr(svg.indexOf('<svg')));
            return svg && svg.hasChildNodes() && svg;
        }

        var symbolRe = /<symbol([^]*?id=(['"])(.+?)\2[^]*?<\/)symbol>/g;
        var symbols = {};

        function parseSymbols(svg, icon) {

            if (!symbols[svg]) {

                symbols[svg] = {};

                symbolRe.lastIndex = 0;

                var match;
                while ((match = symbolRe.exec(svg))) {
                    symbols[svg][match[3]] = "<svg xmlns=\"http://www.w3.org/2000/svg\"" + (match[1]) + "svg>";
                }

            }

            return symbols[svg][icon];
        }

        function applyAnimation(el) {

            var length = getMaxPathLength(el);

            if (length) {
                el.style.setProperty('--uk-animation-stroke', length);
            }

        }

        function getMaxPathLength(el) {
            return Math.ceil(Math.max.apply(Math, [ 0 ].concat( $$('[stroke]', el).map(function (stroke) {
                try {
                    return stroke.getTotalLength();
                } catch (e) {
                    return 0;
                }
            }) )));
        }

        function insertSVG(el, root) {

            if (isVoidElement(root) || root.tagName === 'CANVAS') {

                attr(root, 'hidden', true);

                var next = root.nextElementSibling;
                return equals(el, next)
                    ? next
                    : after(root, el);

            }

            var last = root.lastElementChild;
            return equals(el, last)
                ? last
                : append(root, el);
        }

        function equals(el, other) {
            return attr(el, 'data-svg') === attr(other, 'data-svg');
        }

        var closeIcon = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 14 14\" xmlns=\"http://www.w3.org/2000/svg\"><line fill=\"none\" stroke=\"#000\" stroke-width=\"1.1\" x1=\"1\" y1=\"1\" x2=\"13\" y2=\"13\"/><line fill=\"none\" stroke=\"#000\" stroke-width=\"1.1\" x1=\"13\" y1=\"1\" x2=\"1\" y2=\"13\"/></svg>";

        var closeLarge = "<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"><line fill=\"none\" stroke=\"#000\" stroke-width=\"1.4\" x1=\"1\" y1=\"1\" x2=\"19\" y2=\"19\"/><line fill=\"none\" stroke=\"#000\" stroke-width=\"1.4\" x1=\"19\" y1=\"1\" x2=\"1\" y2=\"19\"/></svg>";

        var marker = "<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"9\" y=\"4\" width=\"1\" height=\"11\"/><rect x=\"4\" y=\"9\" width=\"11\" height=\"1\"/></svg>";

        var navbarToggleIcon = "<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"><rect y=\"9\" width=\"20\" height=\"2\"/><rect y=\"3\" width=\"20\" height=\"2\"/><rect y=\"15\" width=\"20\" height=\"2\"/></svg>";

        var overlayIcon = "<svg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"19\" y=\"0\" width=\"1\" height=\"40\"/><rect x=\"0\" y=\"19\" width=\"40\" height=\"1\"/></svg>";

        var paginationNext = "<svg width=\"7\" height=\"12\" viewBox=\"0 0 7 12\" xmlns=\"http://www.w3.org/2000/svg\"><polyline fill=\"none\" stroke=\"#000\" stroke-width=\"1.2\" points=\"1 1 6 6 1 11\"/></svg>";

        var paginationPrevious = "<svg width=\"7\" height=\"12\" viewBox=\"0 0 7 12\" xmlns=\"http://www.w3.org/2000/svg\"><polyline fill=\"none\" stroke=\"#000\" stroke-width=\"1.2\" points=\"6 1 1 6 6 11\"/></svg>";

        var searchIcon = "<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"><circle fill=\"none\" stroke=\"#000\" stroke-width=\"1.1\" cx=\"9\" cy=\"9\" r=\"7\"/><path fill=\"none\" stroke=\"#000\" stroke-width=\"1.1\" d=\"M14,14 L18,18 L14,14 Z\"/></svg>";

        var searchLarge = "<svg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"><circle fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" cx=\"17.5\" cy=\"17.5\" r=\"16.5\"/><line fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" x1=\"38\" y1=\"39\" x2=\"29\" y2=\"30\"/></svg>";

        var searchNavbar = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><circle fill=\"none\" stroke=\"#000\" stroke-width=\"1.1\" cx=\"10.5\" cy=\"10.5\" r=\"9.5\"/><line fill=\"none\" stroke=\"#000\" stroke-width=\"1.1\" x1=\"23\" y1=\"23\" x2=\"17\" y2=\"17\"/></svg>";

        var slidenavNext = "<svg width=\"14px\" height=\"24px\" viewBox=\"0 0 14 24\" xmlns=\"http://www.w3.org/2000/svg\"><polyline fill=\"none\" stroke=\"#000\" stroke-width=\"1.4\" points=\"1.225,23 12.775,12 1.225,1 \"/></svg>";

        var slidenavNextLarge = "<svg width=\"25px\" height=\"40px\" viewBox=\"0 0 25 40\" xmlns=\"http://www.w3.org/2000/svg\"><polyline fill=\"none\" stroke=\"#000\" stroke-width=\"2\" points=\"4.002,38.547 22.527,20.024 4,1.5 \"/></svg>";

        var slidenavPrevious = "<svg width=\"14px\" height=\"24px\" viewBox=\"0 0 14 24\" xmlns=\"http://www.w3.org/2000/svg\"><polyline fill=\"none\" stroke=\"#000\" stroke-width=\"1.4\" points=\"12.775,1 1.225,12 12.775,23 \"/></svg>";

        var slidenavPreviousLarge = "<svg width=\"25px\" height=\"40px\" viewBox=\"0 0 25 40\" xmlns=\"http://www.w3.org/2000/svg\"><polyline fill=\"none\" stroke=\"#000\" stroke-width=\"2\" points=\"20.527,1.5 2,20.024 20.525,38.547 \"/></svg>";

        var spinner = "<svg width=\"30\" height=\"30\" viewBox=\"0 0 30 30\" xmlns=\"http://www.w3.org/2000/svg\"><circle fill=\"none\" stroke=\"#000\" cx=\"15\" cy=\"15\" r=\"14\"/></svg>";

        var totop = "<svg width=\"18\" height=\"10\" viewBox=\"0 0 18 10\" xmlns=\"http://www.w3.org/2000/svg\"><polyline fill=\"none\" stroke=\"#000\" stroke-width=\"1.2\" points=\"1 9 9 1 17 9 \"/></svg>";

        var icons = {
            spinner: spinner,
            totop: totop,
            marker: marker,
            'close-icon': closeIcon,
            'close-large': closeLarge,
            'navbar-toggle-icon': navbarToggleIcon,
            'overlay-icon': overlayIcon,
            'pagination-next': paginationNext,
            'pagination-previous': paginationPrevious,
            'search-icon': searchIcon,
            'search-large': searchLarge,
            'search-navbar': searchNavbar,
            'slidenav-next': slidenavNext,
            'slidenav-next-large': slidenavNextLarge,
            'slidenav-previous': slidenavPrevious,
            'slidenav-previous-large': slidenavPreviousLarge
        };

        var Icon = {

            install: install,

            extends: SVG,

            args: 'icon',

            props: ['icon'],

            data: {
                include: ['focusable']
            },

            isIcon: true,

            beforeConnect: function() {
                addClass(this.$el, 'uk-icon');
            },

            methods: {

                getSvg: function() {

                    var icon = getIcon(this.icon);

                    if (!icon) {
                        return Promise.reject('Icon not found.');
                    }

                    return Promise.resolve(icon);
                }

            }

        };

        var IconComponent = {

            args: false,

            extends: Icon,

            data: function (vm) { return ({
                icon: hyphenate(vm.constructor.options.name)
            }); },

            beforeConnect: function() {
                addClass(this.$el, this.$name);
            }

        };

        var Slidenav = {

            extends: IconComponent,

            beforeConnect: function() {
                addClass(this.$el, 'uk-slidenav');
            },

            computed: {

                icon: function(ref, $el) {
                    var icon = ref.icon;

                    return hasClass($el, 'uk-slidenav-large')
                        ? (icon + "-large")
                        : icon;
                }

            }

        };

        var Search = {

            extends: IconComponent,

            computed: {

                icon: function(ref, $el) {
                    var icon = ref.icon;

                    return hasClass($el, 'uk-search-icon') && parents($el, '.uk-search-large').length
                        ? 'search-large'
                        : parents($el, '.uk-search-navbar').length
                            ? 'search-navbar'
                            : icon;
                }

            }

        };

        var Close = {

            extends: IconComponent,

            computed: {

                icon: function() {
                    return ("close-" + (hasClass(this.$el, 'uk-close-large') ? 'large' : 'icon'));
                }

            }

        };

        var Spinner = {

            extends: IconComponent,

            connected: function() {
                var this$1 = this;

                this.svg.then(function (svg) { return this$1.ratio !== 1 && css($('circle', svg), 'strokeWidth', 1 / this$1.ratio); }, noop);
            }

        };

        var parsed = {};
        function install(UIkit) {
            UIkit.icon.add = function (name, svg) {
                var obj;


                var added = isString(name) ? (( obj = {}, obj[name] = svg, obj )) : name;
                each(added, function (svg, name) {
                    icons[name] = svg;
                    delete parsed[name];
                });

                if (UIkit._initialized) {
                    apply(document.body, function (el) { return each(UIkit.getComponents(el), function (cmp) {
                            cmp.$options.isIcon && cmp.icon in added && cmp.$reset();
                        }); }
                    );
                }
            };
        }

        function getIcon(icon) {

            if (!icons[icon]) {
                return null;
            }

            if (!parsed[icon]) {
                parsed[icon] = $((icons[applyRtl(icon)] || icons[icon]).trim());
            }

            return parsed[icon].cloneNode(true);
        }

        function applyRtl(icon) {
            return isRtl ? swap(swap(icon, 'left', 'right'), 'previous', 'next') : icon;
        }

        var img = {

            args: 'dataSrc',

            props: {
                dataSrc: String,
                dataSrcset: Boolean,
                sizes: String,
                width: Number,
                height: Number,
                offsetTop: String,
                offsetLeft: String,
                target: String
            },

            data: {
                dataSrc: '',
                dataSrcset: false,
                sizes: false,
                width: false,
                height: false,
                offsetTop: '50vh',
                offsetLeft: 0,
                target: false
            },

            computed: {

                cacheKey: function(ref) {
                    var dataSrc = ref.dataSrc;

                    return ((this.$name) + "." + dataSrc);
                },

                width: function(ref) {
                    var width = ref.width;
                    var dataWidth = ref.dataWidth;

                    return width || dataWidth;
                },

                height: function(ref) {
                    var height = ref.height;
                    var dataHeight = ref.dataHeight;

                    return height || dataHeight;
                },

                sizes: function(ref) {
                    var sizes = ref.sizes;
                    var dataSizes = ref.dataSizes;

                    return sizes || dataSizes;
                },

                isImg: function(_, $el) {
                    return isImg($el);
                },

                target: {

                    get: function(ref) {
                        var target = ref.target;

                        return [this.$el ].concat( queryAll(target, this.$el));
                    },

                    watch: function() {
                        this.observe();
                    }

                },

                offsetTop: function(ref) {
                    var offsetTop = ref.offsetTop;

                    return toPx(offsetTop, 'height');
                },

                offsetLeft: function(ref) {
                    var offsetLeft = ref.offsetLeft;

                    return toPx(offsetLeft, 'width');
                }

            },

            connected: function() {

                if (storage[this.cacheKey]) {
                    setSrcAttrs(this.$el, storage[this.cacheKey] || this.dataSrc, this.dataSrcset, this.sizes);
                } else if (this.isImg && this.width && this.height) {
                    setSrcAttrs(this.$el, getPlaceholderImage(this.width, this.height, this.sizes));
                }

                this.observer = new IntersectionObserver(this.load, {
                    rootMargin: ((this.offsetTop) + "px " + (this.offsetLeft) + "px")
                });

                requestAnimationFrame(this.observe);

            },

            disconnected: function() {
                this.observer.disconnect();
            },

            update: {

                read: function(ref) {
                    var this$1 = this;
                    var image = ref.image;


                    if (!image && document.readyState === 'complete') {
                        this.load(this.observer.takeRecords());
                    }

                    if (this.isImg) {
                        return false;
                    }

                    image && image.then(function (img) { return img && img.currentSrc !== '' && setSrcAttrs(this$1.$el, currentSrc(img)); });

                },

                write: function(data) {

                    if (this.dataSrcset && window.devicePixelRatio !== 1) {

                        var bgSize = css(this.$el, 'backgroundSize');
                        if (bgSize.match(/^(auto\s?)+$/) || toFloat(bgSize) === data.bgSize) {
                            data.bgSize = getSourceSize(this.dataSrcset, this.sizes);
                            css(this.$el, 'backgroundSize', ((data.bgSize) + "px"));
                        }

                    }

                },

                events: ['resize']

            },

            methods: {

                load: function(entries) {
                    var this$1 = this;


                    // Old chromium based browsers (UC Browser) did not implement `isIntersecting`
                    if (!entries.some(function (entry) { return isUndefined(entry.isIntersecting) || entry.isIntersecting; })) {
                        return;
                    }

                    this._data.image = getImage(this.dataSrc, this.dataSrcset, this.sizes).then(function (img) {

                        setSrcAttrs(this$1.$el, currentSrc(img), img.srcset, img.sizes);
                        storage[this$1.cacheKey] = currentSrc(img);
                        return img;

                    }, noop);

                    this.observer.disconnect();
                },

                observe: function() {
                    var this$1 = this;

                    if (this._connected && !this._data.image) {
                        this.target.forEach(function (el) { return this$1.observer.observe(el); });
                    }
                }

            }

        };

        function setSrcAttrs(el, src, srcset, sizes) {

            if (isImg(el)) {
                sizes && (el.sizes = sizes);
                srcset && (el.srcset = srcset);
                src && (el.src = src);
            } else if (src) {

                var change = !includes(el.style.backgroundImage, src);
                if (change) {
                    css(el, 'backgroundImage', ("url(" + (escape(src)) + ")"));
                    trigger(el, createEvent('load', false));
                }

            }

        }

        function getPlaceholderImage(width, height, sizes) {
            var assign;


            if (sizes) {
                ((assign = Dimensions.ratio({width: width, height: height}, 'width', toPx(sizesToPixel(sizes))), width = assign.width, height = assign.height));
            }

            return ("data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + width + "\" height=\"" + height + "\"></svg>");
        }

        var sizesRe = /\s*(.*?)\s*(\w+|calc\(.*?\))\s*(?:,|$)/g;
        function sizesToPixel(sizes) {
            var matches;

            sizesRe.lastIndex = 0;

            while ((matches = sizesRe.exec(sizes))) {
                if (!matches[1] || window.matchMedia(matches[1]).matches) {
                    matches = evaluateSize(matches[2]);
                    break;
                }
            }

            return matches || '100vw';
        }

        var sizeRe = /\d+(?:\w+|%)/g;
        var additionRe = /[+-]?(\d+)/g;
        function evaluateSize(size) {
            return startsWith(size, 'calc')
                ? size
                    .substring(5, size.length - 1)
                    .replace(sizeRe, function (size) { return toPx(size); })
                    .replace(/ /g, '')
                    .match(additionRe)
                    .reduce(function (a, b) { return a + +b; }, 0)
                : size;
        }

        var srcSetRe = /\s+\d+w\s*(?:,|$)/g;
        function getSourceSize(srcset, sizes) {
            var srcSize = toPx(sizesToPixel(sizes));
            var descriptors = (srcset.match(srcSetRe) || []).map(toFloat).sort(function (a, b) { return a - b; });

            return descriptors.filter(function (size) { return size >= srcSize; })[0] || descriptors.pop() || '';
        }

        function isImg(el) {
            return el.tagName === 'IMG';
        }

        function currentSrc(el) {
            return el.currentSrc || el.src;
        }

        var key = '__test__';
        var storage;

        // workaround for Safari's private browsing mode and accessing sessionStorage in Blink
        try {
            storage = window.sessionStorage || {};
            storage[key] = 1;
            delete storage[key];
        } catch (e) {
            storage = {};
        }

        var Media = {

            props: {
                media: Boolean
            },

            data: {
                media: false
            },

            computed: {

                matchMedia: function() {
                    var media = toMedia(this.media);
                    return !media || window.matchMedia(media).matches;
                }

            }

        };

        function toMedia(value) {

            if (isString(value)) {
                if (value[0] === '@') {
                    var name = "breakpoint-" + (value.substr(1));
                    value = toFloat(getCssVar(name));
                } else if (isNaN(value)) {
                    return value;
                }
            }

            return value && !isNaN(value) ? ("(min-width: " + value + "px)") : false;
        }

        var leader = {

            mixins: [Class, Media],

            props: {
                fill: String
            },

            data: {
                fill: '',
                clsWrapper: 'uk-leader-fill',
                clsHide: 'uk-leader-hide',
                attrFill: 'data-fill'
            },

            computed: {

                fill: function(ref) {
                    var fill = ref.fill;

                    return fill || getCssVar('leader-fill-content');
                }

            },

            connected: function() {
                var assign;

                (assign = wrapInner(this.$el, ("<span class=\"" + (this.clsWrapper) + "\">")), this.wrapper = assign[0]);
            },

            disconnected: function() {
                unwrap(this.wrapper.childNodes);
            },

            update: {

                read: function(ref) {
                    var changed = ref.changed;
                    var width = ref.width;


                    var prev = width;

                    width = Math.floor(this.$el.offsetWidth / 2);

                    return {
                        width: width,
                        fill: this.fill,
                        changed: changed || prev !== width,
                        hide: !this.matchMedia
                    };
                },

                write: function(data) {

                    toggleClass(this.wrapper, this.clsHide, data.hide);

                    if (data.changed) {
                        data.changed = false;
                        attr(this.wrapper, this.attrFill, new Array(data.width).join(data.fill));
                    }

                },

                events: ['resize']

            }

        };

        var Container = {

            props: {
                container: Boolean
            },

            data: {
                container: true
            },

            computed: {

                container: function(ref) {
                    var container = ref.container;

                    return container === true && this.$container || container && $(container);
                }

            }

        };

        var active$1 = [];

        var Modal = {

            mixins: [Class, Container, Togglable],

            props: {
                selPanel: String,
                selClose: String,
                escClose: Boolean,
                bgClose: Boolean,
                stack: Boolean
            },

            data: {
                cls: 'uk-open',
                escClose: true,
                bgClose: true,
                overlay: true,
                stack: false
            },

            computed: {

                panel: function(ref, $el) {
                    var selPanel = ref.selPanel;

                    return $(selPanel, $el);
                },

                transitionElement: function() {
                    return this.panel;
                },

                bgClose: function(ref) {
                    var bgClose = ref.bgClose;

                    return bgClose && this.panel;
                }

            },

            beforeDisconnect: function() {
                if (this.isToggled()) {
                    this.toggleElement(this.$el, false, false);
                }
            },

            events: [

                {

                    name: 'click',

                    delegate: function() {
                        return this.selClose;
                    },

                    handler: function(e) {
                        e.preventDefault();
                        this.hide();
                    }

                },

                {

                    name: 'toggle',

                    self: true,

                    handler: function(e) {

                        if (e.defaultPrevented) {
                            return;
                        }

                        e.preventDefault();

                        if (this.isToggled() === includes(active$1, this)) {
                            this.toggle();
                        }
                    }

                },

                {
                    name: 'beforeshow',

                    self: true,

                    handler: function(e) {

                        if (includes(active$1, this)) {
                            return false;
                        }

                        if (!this.stack && active$1.length) {
                            Promise.all(active$1.map(function (modal) { return modal.hide(); })).then(this.show);
                            e.preventDefault();
                        } else {
                            active$1.push(this);
                        }
                    }

                },

                {

                    name: 'show',

                    self: true,

                    handler: function() {
                        var this$1 = this;


                        if (width(window) - width(document) && this.overlay) {
                            css(document.body, 'overflowY', 'scroll');
                        }

                        this.stack && css(this.$el, 'zIndex', css(this.$el, 'zIndex') + active$1.length);

                        addClass(document.documentElement, this.clsPage);

                        if (this.bgClose) {
                            once(this.$el, 'hide', on(document, pointerDown, function (ref) {
                                var target = ref.target;


                                if (last(active$1) !== this$1 || this$1.overlay && !within(target, this$1.$el) || within(target, this$1.panel)) {
                                    return;
                                }

                                once(document, (pointerUp + " " + pointerCancel + " scroll"), function (ref) {
                                    var defaultPrevented = ref.defaultPrevented;
                                    var type = ref.type;
                                    var newTarget = ref.target;

                                    if (!defaultPrevented && type === pointerUp && target === newTarget) {
                                        this$1.hide();
                                    }
                                }, true);

                            }), {self: true});
                        }

                        if (this.escClose) {
                            once(this.$el, 'hide', on(document, 'keydown', function (e) {
                                if (e.keyCode === 27 && last(active$1) === this$1) {
                                    e.preventDefault();
                                    this$1.hide();
                                }
                            }), {self: true});
                        }
                    }

                },

                {

                    name: 'hidden',

                    self: true,

                    handler: function() {
                        var this$1 = this;


                        active$1.splice(active$1.indexOf(this), 1);

                        if (!active$1.length) {
                            css(document.body, 'overflowY', '');
                        }

                        css(this.$el, 'zIndex', '');

                        if (!active$1.some(function (modal) { return modal.clsPage === this$1.clsPage; })) {
                            removeClass(document.documentElement, this.clsPage);
                        }

                    }

                }

            ],

            methods: {

                toggle: function() {
                    return this.isToggled() ? this.hide() : this.show();
                },

                show: function() {
                    var this$1 = this;


                    if (this.container && this.$el.parentNode !== this.container) {
                        append(this.container, this.$el);
                        return new Promise(function (resolve) { return requestAnimationFrame(function () { return this$1.show().then(resolve); }
                            ); }
                        );
                    }

                    return this.toggleElement(this.$el, true, animate$1(this));
                },

                hide: function() {
                    return this.toggleElement(this.$el, false, animate$1(this));
                }

            }

        };

        function animate$1(ref) {
            var transitionElement = ref.transitionElement;
            var _toggle = ref._toggle;

            return function (el, show) { return new Promise(function (resolve, reject) { return once(el, 'show hide', function () {
                        el._reject && el._reject();
                        el._reject = reject;

                        _toggle(el, show);

                        var off = once(transitionElement, 'transitionstart', function () {
                            once(transitionElement, 'transitionend transitioncancel', resolve, {self: true});
                            clearTimeout(timer);
                        }, {self: true});

                        var timer = setTimeout(function () {
                            off();
                            resolve();
                        }, toMs(css(transitionElement, 'transitionDuration')));

                    }); }
                ); };
        }

        var modal = {

            install: install$1,

            mixins: [Modal],

            data: {
                clsPage: 'uk-modal-page',
                selPanel: '.uk-modal-dialog',
                selClose: '.uk-modal-close, .uk-modal-close-default, .uk-modal-close-outside, .uk-modal-close-full'
            },

            events: [

                {
                    name: 'show',

                    self: true,

                    handler: function() {

                        if (hasClass(this.panel, 'uk-margin-auto-vertical')) {
                            addClass(this.$el, 'uk-flex');
                        } else {
                            css(this.$el, 'display', 'block');
                        }

                        height(this.$el); // force reflow
                    }
                },

                {
                    name: 'hidden',

                    self: true,

                    handler: function() {

                        css(this.$el, 'display', '');
                        removeClass(this.$el, 'uk-flex');

                    }
                }

            ]

        };

        function install$1(ref) {
            var modal = ref.modal;


            modal.dialog = function (content, options) {

                var dialog = modal(
                    ("<div class=\"uk-modal\"> <div class=\"uk-modal-dialog\">" + content + "</div> </div>"),
                    options
                );

                dialog.show();

                on(dialog.$el, 'hidden', function () { return Promise.resolve().then(function () { return dialog.$destroy(true); }
                    ); }, {self: true}
                );

                return dialog;
            };

            modal.alert = function (message, options) {
                return openDialog(
                    function (ref) {
                        var labels = ref.labels;

                        return ("<div class=\"uk-modal-body\">" + (isString(message) ? message : html(message)) + "</div> <div class=\"uk-modal-footer uk-text-right\"> <button class=\"uk-button uk-button-primary uk-modal-close\" autofocus>" + (labels.ok) + "</button> </div>");
                },
                    options,
                    function (deferred) { return deferred.resolve(); }
                );
            };

            modal.confirm = function (message, options) {
                return openDialog(
                    function (ref) {
                        var labels = ref.labels;

                        return ("<form> <div class=\"uk-modal-body\">" + (isString(message) ? message : html(message)) + "</div> <div class=\"uk-modal-footer uk-text-right\"> <button class=\"uk-button uk-button-default uk-modal-close\" type=\"button\">" + (labels.cancel) + "</button> <button class=\"uk-button uk-button-primary\" autofocus>" + (labels.ok) + "</button> </div> </form>");
                },
                    options,
                    function (deferred) { return deferred.reject(); }
                );
            };

            modal.prompt = function (message, value, options) {
                return openDialog(
                    function (ref) {
                        var labels = ref.labels;

                        return ("<form class=\"uk-form-stacked\"> <div class=\"uk-modal-body\"> <label>" + (isString(message) ? message : html(message)) + "</label> <input class=\"uk-input\" value=\"" + (value || '') + "\" autofocus> </div> <div class=\"uk-modal-footer uk-text-right\"> <button class=\"uk-button uk-button-default uk-modal-close\" type=\"button\">" + (labels.cancel) + "</button> <button class=\"uk-button uk-button-primary\">" + (labels.ok) + "</button> </div> </form>");
                },
                    options,
                    function (deferred) { return deferred.resolve(null); },
                    function (dialog) { return $('input', dialog.$el).value; }
                );
            };

            modal.labels = {
                ok: 'Ok',
                cancel: 'Cancel'
            };

            function openDialog(tmpl, options, hideFn, submitFn) {

                options = assign({bgClose: false, escClose: true, labels: modal.labels}, options);

                var dialog = modal.dialog(tmpl(options), options);
                var deferred = new Deferred();

                var resolved = false;

                on(dialog.$el, 'submit', 'form', function (e) {
                    e.preventDefault();
                    deferred.resolve(submitFn && submitFn(dialog));
                    resolved = true;
                    dialog.hide();
                });

                on(dialog.$el, 'hide', function () { return !resolved && hideFn(deferred); });

                deferred.promise.dialog = dialog;

                return deferred.promise;
            }

        }

        var nav = {

            extends: Accordion,

            data: {
                targets: '> .uk-parent',
                toggle: '> a',
                content: '> ul'
            }

        };

        var navbar = {

            mixins: [Class, FlexBug],

            props: {
                dropdown: String,
                mode: 'list',
                align: String,
                offset: Number,
                boundary: Boolean,
                boundaryAlign: Boolean,
                clsDrop: String,
                delayShow: Number,
                delayHide: Number,
                dropbar: Boolean,
                dropbarMode: String,
                dropbarAnchor: Boolean,
                duration: Number
            },

            data: {
                dropdown: '.uk-navbar-nav > li',
                align: !isRtl ? 'left' : 'right',
                clsDrop: 'uk-navbar-dropdown',
                mode: undefined,
                offset: undefined,
                delayShow: undefined,
                delayHide: undefined,
                boundaryAlign: undefined,
                flip: 'x',
                boundary: true,
                dropbar: false,
                dropbarMode: 'slide',
                dropbarAnchor: false,
                duration: 200,
                forceHeight: true,
                selMinHeight: '.uk-navbar-nav > li > a, .uk-navbar-item, .uk-navbar-toggle'
            },

            computed: {

                boundary: function(ref, $el) {
                    var boundary = ref.boundary;
                    var boundaryAlign = ref.boundaryAlign;

                    return (boundary === true || boundaryAlign) ? $el : boundary;
                },

                dropbarAnchor: function(ref, $el) {
                    var dropbarAnchor = ref.dropbarAnchor;

                    return query(dropbarAnchor, $el);
                },

                pos: function(ref) {
                    var align = ref.align;

                    return ("bottom-" + align);
                },

                dropbar: {

                    get: function(ref) {
                        var dropbar = ref.dropbar;


                        if (!dropbar) {
                            return null;
                        }

                        dropbar = this._dropbar || query(dropbar, this.$el) || $('+ .uk-navbar-dropbar', this.$el);

                        return dropbar ? dropbar : (this._dropbar = $('<div></div>'));

                    },

                    watch: function(dropbar) {
                        addClass(dropbar, 'uk-navbar-dropbar');
                    },

                    immediate: true

                },

                dropdowns: {

                    get: function(ref, $el) {
                        var dropdown = ref.dropdown;
                        var clsDrop = ref.clsDrop;

                        return $$((dropdown + " ." + clsDrop), $el);
                    },

                    watch: function(dropdowns) {
                        var this$1 = this;

                        this.$create(
                            'drop',
                            dropdowns.filter(function (el) { return !this$1.getDropdown(el); }),
                            assign({}, this.$props, {boundary: this.boundary, pos: this.pos, offset: this.dropbar || this.offset})
                        );
                    },

                    immediate: true

                }

            },

            disconnected: function() {
                this.dropbar && remove(this.dropbar);
                delete this._dropbar;
            },

            events: [

                {
                    name: 'mouseover',

                    delegate: function() {
                        return this.dropdown;
                    },

                    handler: function(ref) {
                        var current = ref.current;

                        var active = this.getActive();
                        if (active && active.toggle && !within(active.toggle.$el, current) && !active.tracker.movesTo(active.$el)) {
                            active.hide(false);
                        }
                    }

                },

                {
                    name: 'mouseleave',

                    el: function() {
                        return this.dropbar;
                    },

                    handler: function() {
                        var active = this.getActive();

                        if (active && !this.dropdowns.some(function (el) { return matches(el, ':hover'); })) {
                            active.hide();
                        }
                    }
                },

                {
                    name: 'beforeshow',

                    capture: true,

                    filter: function() {
                        return this.dropbar;
                    },

                    handler: function() {

                        if (!this.dropbar.parentNode) {
                            after(this.dropbarAnchor || this.$el, this.dropbar);
                        }

                    }
                },

                {
                    name: 'show',

                    capture: true,

                    filter: function() {
                        return this.dropbar;
                    },

                    handler: function(_, drop) {

                        var $el = drop.$el;
                        var dir = drop.dir;

                        toggleClass(this.dropbar, 'uk-navbar-dropbar-slide', this.dropbarMode === 'slide' || parents(this.$el).some(function (el) { return css(el, 'position') !== 'static'; }));

                        this.clsDrop && addClass($el, ((this.clsDrop) + "-dropbar"));

                        if (dir === 'bottom') {
                            this.transitionTo($el.offsetHeight + toFloat(css($el, 'marginTop')) + toFloat(css($el, 'marginBottom')), $el);
                        }
                    }
                },

                {
                    name: 'beforehide',

                    filter: function() {
                        return this.dropbar;
                    },

                    handler: function(e, ref) {
                        var $el = ref.$el;


                        var active = this.getActive();

                        if (matches(this.dropbar, ':hover') && active && active.$el === $el) {
                            e.preventDefault();
                        }
                    }
                },

                {
                    name: 'hide',

                    filter: function() {
                        return this.dropbar;
                    },

                    handler: function(_, ref) {
                        var $el = ref.$el;


                        var active = this.getActive();

                        if (!active || active && active.$el === $el) {
                            this.transitionTo(0);
                        }
                    }
                }

            ],

            methods: {

                getActive: function() {
                    var ref = this.dropdowns.map(this.getDropdown).filter(function (drop) { return drop && drop.isActive(); });
                    var active = ref[0];
                    return active && includes(active.mode, 'hover') && within(active.toggle.$el, this.$el) && active;
                },

                transitionTo: function(newHeight, el) {
                    var this$1 = this;


                    var ref = this;
                    var dropbar = ref.dropbar;
                    var oldHeight = isVisible(dropbar) ? height(dropbar) : 0;

                    el = oldHeight < newHeight && el;

                    css(el, 'clip', ("rect(0," + (el.offsetWidth) + "px," + oldHeight + "px,0)"));

                    height(dropbar, oldHeight);

                    Transition.cancel([el, dropbar]);
                    return Promise.all([
                        Transition.start(dropbar, {height: newHeight}, this.duration),
                        Transition.start(el, {clip: ("rect(0," + (el.offsetWidth) + "px," + newHeight + "px,0)")}, this.duration)
                    ])
                        .catch(noop)
                        .then(function () {
                            css(el, {clip: ''});
                            this$1.$update(dropbar);
                        });
                },

                getDropdown: function(el) {
                    return this.$getComponent(el, 'drop') || this.$getComponent(el, 'dropdown');
                }

            }

        };

        var offcanvas = {

            mixins: [Modal],

            args: 'mode',

            props: {
                mode: String,
                flip: Boolean,
                overlay: Boolean
            },

            data: {
                mode: 'slide',
                flip: false,
                overlay: false,
                clsPage: 'uk-offcanvas-page',
                clsContainer: 'uk-offcanvas-container',
                selPanel: '.uk-offcanvas-bar',
                clsFlip: 'uk-offcanvas-flip',
                clsContainerAnimation: 'uk-offcanvas-container-animation',
                clsSidebarAnimation: 'uk-offcanvas-bar-animation',
                clsMode: 'uk-offcanvas',
                clsOverlay: 'uk-offcanvas-overlay',
                selClose: '.uk-offcanvas-close',
                container: false
            },

            computed: {

                clsFlip: function(ref) {
                    var flip = ref.flip;
                    var clsFlip = ref.clsFlip;

                    return flip ? clsFlip : '';
                },

                clsOverlay: function(ref) {
                    var overlay = ref.overlay;
                    var clsOverlay = ref.clsOverlay;

                    return overlay ? clsOverlay : '';
                },

                clsMode: function(ref) {
                    var mode = ref.mode;
                    var clsMode = ref.clsMode;

                    return (clsMode + "-" + mode);
                },

                clsSidebarAnimation: function(ref) {
                    var mode = ref.mode;
                    var clsSidebarAnimation = ref.clsSidebarAnimation;

                    return mode === 'none' || mode === 'reveal' ? '' : clsSidebarAnimation;
                },

                clsContainerAnimation: function(ref) {
                    var mode = ref.mode;
                    var clsContainerAnimation = ref.clsContainerAnimation;

                    return mode !== 'push' && mode !== 'reveal' ? '' : clsContainerAnimation;
                },

                transitionElement: function(ref) {
                    var mode = ref.mode;

                    return mode === 'reveal' ? this.panel.parentNode : this.panel;
                }

            },

            events: [

                {

                    name: 'click',

                    delegate: function() {
                        return 'a[href^="#"]';
                    },

                    handler: function(ref) {
                        var hash = ref.current.hash;
                        var defaultPrevented = ref.defaultPrevented;

                        if (!defaultPrevented && hash && $(hash, document.body)) {
                            this.hide();
                        }
                    }

                },

                {
                    name: 'touchstart',

                    passive: true,

                    el: function() {
                        return this.panel;
                    },

                    handler: function(ref) {
                        var targetTouches = ref.targetTouches;


                        if (targetTouches.length === 1) {
                            this.clientY = targetTouches[0].clientY;
                        }

                    }

                },

                {
                    name: 'touchmove',

                    self: true,
                    passive: false,

                    filter: function() {
                        return this.overlay;
                    },

                    handler: function(e) {
                        e.cancelable && e.preventDefault();
                    }

                },

                {
                    name: 'touchmove',

                    passive: false,

                    el: function() {
                        return this.panel;
                    },

                    handler: function(e) {

                        if (e.targetTouches.length !== 1) {
                            return;
                        }

                        var clientY = event.targetTouches[0].clientY - this.clientY;
                        var ref = this.panel;
                        var scrollTop = ref.scrollTop;
                        var scrollHeight = ref.scrollHeight;
                        var clientHeight = ref.clientHeight;

                        if (clientHeight >= scrollHeight
                            || scrollTop === 0 && clientY > 0
                            || scrollHeight - scrollTop <= clientHeight && clientY < 0
                        ) {
                            e.cancelable && e.preventDefault();
                        }

                    }

                },

                {
                    name: 'show',

                    self: true,

                    handler: function() {

                        if (this.mode === 'reveal' && !hasClass(this.panel.parentNode, this.clsMode)) {
                            wrapAll(this.panel, '<div>');
                            addClass(this.panel.parentNode, this.clsMode);
                        }

                        css(document.documentElement, 'overflowY', this.overlay ? 'hidden' : '');
                        addClass(document.body, this.clsContainer, this.clsFlip);
                        css(document.body, 'touch-action', 'pan-y pinch-zoom');
                        css(this.$el, 'display', 'block');
                        addClass(this.$el, this.clsOverlay);
                        addClass(this.panel, this.clsSidebarAnimation, this.mode !== 'reveal' ? this.clsMode : '');

                        height(document.body); // force reflow
                        addClass(document.body, this.clsContainerAnimation);

                        this.clsContainerAnimation && suppressUserScale();


                    }
                },

                {
                    name: 'hide',

                    self: true,

                    handler: function() {
                        removeClass(document.body, this.clsContainerAnimation);
                        css(document.body, 'touch-action', '');
                    }
                },

                {
                    name: 'hidden',

                    self: true,

                    handler: function() {

                        this.clsContainerAnimation && resumeUserScale();

                        if (this.mode === 'reveal') {
                            unwrap(this.panel);
                        }

                        removeClass(this.panel, this.clsSidebarAnimation, this.clsMode);
                        removeClass(this.$el, this.clsOverlay);
                        css(this.$el, 'display', '');
                        removeClass(document.body, this.clsContainer, this.clsFlip);

                        css(document.documentElement, 'overflowY', '');

                    }
                },

                {
                    name: 'swipeLeft swipeRight',

                    handler: function(e) {

                        if (this.isToggled() && endsWith(e.type, 'Left') ^ this.flip) {
                            this.hide();
                        }

                    }
                }

            ]

        };

        // Chrome in responsive mode zooms page upon opening offcanvas
        function suppressUserScale() {
            getViewport$1().content += ',user-scalable=0';
        }

        function resumeUserScale() {
            var viewport = getViewport$1();
            viewport.content = viewport.content.replace(/,user-scalable=0$/, '');
        }

        function getViewport$1() {
            return $('meta[name="viewport"]', document.head) || append(document.head, '<meta name="viewport">');
        }

        var overflowAuto = {

            mixins: [Class],

            props: {
                selContainer: String,
                selContent: String
            },

            data: {
                selContainer: '.uk-modal',
                selContent: '.uk-modal-dialog'
            },

            computed: {

                container: function(ref, $el) {
                    var selContainer = ref.selContainer;

                    return closest($el, selContainer);
                },

                content: function(ref, $el) {
                    var selContent = ref.selContent;

                    return closest($el, selContent);
                }

            },

            connected: function() {
                css(this.$el, 'minHeight', 150);
            },

            update: {

                read: function() {

                    if (!this.content || !this.container) {
                        return false;
                    }

                    return {
                        current: toFloat(css(this.$el, 'maxHeight')),
                        max: Math.max(150, height(this.container) - (offset(this.content).height - height(this.$el)))
                    };
                },

                write: function(ref) {
                    var current = ref.current;
                    var max = ref.max;

                    css(this.$el, 'maxHeight', max);
                    if (Math.round(current) !== Math.round(max)) {
                        trigger(this.$el, 'resize');
                    }
                },

                events: ['resize']

            }

        };

        var responsive = {

            props: ['width', 'height'],

            connected: function() {
                addClass(this.$el, 'uk-responsive-width');
            },

            update: {

                read: function() {
                    return isVisible(this.$el) && this.width && this.height
                        ? {width: width(this.$el.parentNode), height: this.height}
                        : false;
                },

                write: function(dim) {
                    height(this.$el, Dimensions.contain({
                        height: this.height,
                        width: this.width
                    }, dim).height);
                },

                events: ['resize']

            }

        };

        var scroll = {

            props: {
                offset: Number
            },

            data: {
                offset: 0
            },

            methods: {

                scrollTo: function(el) {
                    var this$1 = this;


                    el = el && $(el) || document.body;

                    if (trigger(this.$el, 'beforescroll', [this, el])) {
                        scrollIntoView(el, {offset: this.offset}).then(function () { return trigger(this$1.$el, 'scrolled', [this$1, el]); }
                        );
                    }

                }

            },

            events: {

                click: function(e) {

                    if (e.defaultPrevented) {
                        return;
                    }

                    e.preventDefault();
                    this.scrollTo(escape(decodeURIComponent(this.$el.hash)).substr(1));
                }

            }

        };

        var scrollspy = {

            args: 'cls',

            props: {
                cls: String,
                target: String,
                hidden: Boolean,
                offsetTop: Number,
                offsetLeft: Number,
                repeat: Boolean,
                delay: Number
            },

            data: function () { return ({
                cls: false,
                target: false,
                hidden: true,
                offsetTop: 0,
                offsetLeft: 0,
                repeat: false,
                delay: 0,
                inViewClass: 'uk-scrollspy-inview'
            }); },

            computed: {

                elements: {

                    get: function(ref, $el) {
                        var target = ref.target;

                        return target ? $$(target, $el) : [$el];
                    },

                    watch: function(elements) {
                        if (this.hidden) {
                            css(filter(elements, (":not(." + (this.inViewClass) + ")")), 'visibility', 'hidden');
                        }
                    },

                    immediate: true

                }

            },

            update: [

                {

                    read: function(ref) {
                        var this$1 = this;
                        var update = ref.update;


                        if (!update) {
                            return;
                        }

                        this.elements.forEach(function (el) {

                            var state = el._ukScrollspyState;

                            if (!state) {
                                state = {cls: data(el, 'uk-scrollspy-class') || this$1.cls};
                            }

                            state.show = isInView(el, this$1.offsetTop, this$1.offsetLeft);
                            el._ukScrollspyState = state;

                        });

                    },

                    write: function(data) {
                        var this$1 = this;


                        // Let child components be applied at least once first
                        if (!data.update) {
                            this.$update();
                            return data.update = true;
                        }

                        this.elements.forEach(function (el) {

                            var state = el._ukScrollspyState;
                            var toggle = function (inview) {

                                css(el, 'visibility', !inview && this$1.hidden ? 'hidden' : '');

                                toggleClass(el, this$1.inViewClass, inview);
                                toggleClass(el, state.cls);

                                trigger(el, inview ? 'inview' : 'outview');

                                state.inview = inview;

                                this$1.$update(el);

                            };

                            if (state.show && !state.inview && !state.queued) {

                                state.queued = true;

                                data.promise = (data.promise || Promise.resolve()).then(function () { return new Promise(function (resolve) { return setTimeout(resolve, this$1.delay); }
                                    ); }
                                ).then(function () {
                                    toggle(true);
                                    setTimeout(function () { return state.queued = false; }, 300);
                                });

                            } else if (!state.show && state.inview && !state.queued && this$1.repeat) {

                                toggle(false);

                            }

                        });

                    },

                    events: ['scroll', 'resize']

                }

            ]

        };

        var scrollspyNav = {

            props: {
                cls: String,
                closest: String,
                scroll: Boolean,
                overflow: Boolean,
                offset: Number
            },

            data: {
                cls: 'uk-active',
                closest: false,
                scroll: false,
                overflow: true,
                offset: 0
            },

            computed: {

                links: {

                    get: function(_, $el) {
                        return $$('a[href^="#"]', $el).filter(function (el) { return el.hash; });
                    },

                    watch: function(links) {
                        if (this.scroll) {
                            this.$create('scroll', links, {offset: this.offset || 0});
                        }
                    },

                    immediate: true

                },

                targets: function() {
                    return $$(this.links.map(function (el) { return escape(el.hash).substr(1); }).join(','));
                },

                elements: function(ref) {
                    var selector = ref.closest;

                    return closest(this.links, selector || '*');
                }

            },

            update: [

                {

                    read: function() {
                        var this$1 = this;


                        var ref = this.targets;
                        var length = ref.length;

                        if (!length || !isVisible(this.$el)) {
                            return false;
                        }

                        var scrollElement = last(scrollParents(this.targets[0]));
                        var scrollTop = scrollElement.scrollTop;
                        var scrollHeight = scrollElement.scrollHeight;
                        var viewport = getViewport(scrollElement);
                        var max = scrollHeight - offset(viewport).height;
                        var active = false;

                        if (scrollTop === max) {
                            active = length - 1;
                        } else {

                            this.targets.every(function (el, i) {
                                if (position(el, viewport).top - this$1.offset <= 0) {
                                    active = i;
                                    return true;
                                }
                            });

                            if (active === false && this.overflow) {
                                active = 0;
                            }
                        }

                        return {active: active};
                    },

                    write: function(ref) {
                        var active = ref.active;


                        this.links.forEach(function (el) { return el.blur(); });
                        removeClass(this.elements, this.cls);

                        if (active !== false) {
                            trigger(this.$el, 'active', [active, addClass(this.elements[active], this.cls)]);
                        }

                    },

                    events: ['scroll', 'resize']

                }

            ]

        };

        var sticky = {

            mixins: [Class, Media],

            props: {
                top: null,
                bottom: Boolean,
                offset: String,
                animation: String,
                clsActive: String,
                clsInactive: String,
                clsFixed: String,
                clsBelow: String,
                selTarget: String,
                widthElement: Boolean,
                showOnUp: Boolean,
                targetOffset: Number
            },

            data: {
                top: 0,
                bottom: false,
                offset: 0,
                animation: '',
                clsActive: 'uk-active',
                clsInactive: '',
                clsFixed: 'uk-sticky-fixed',
                clsBelow: 'uk-sticky-below',
                selTarget: '',
                widthElement: false,
                showOnUp: false,
                targetOffset: false
            },

            computed: {

                offset: function(ref) {
                    var offset = ref.offset;

                    return toPx(offset);
                },

                selTarget: function(ref, $el) {
                    var selTarget = ref.selTarget;

                    return selTarget && $(selTarget, $el) || $el;
                },

                widthElement: function(ref, $el) {
                    var widthElement = ref.widthElement;

                    return query(widthElement, $el) || this.placeholder;
                },

                isActive: {

                    get: function() {
                        return hasClass(this.selTarget, this.clsActive);
                    },

                    set: function(value) {
                        if (value && !this.isActive) {
                            replaceClass(this.selTarget, this.clsInactive, this.clsActive);
                            trigger(this.$el, 'active');
                        } else if (!value && !hasClass(this.selTarget, this.clsInactive)) {
                            replaceClass(this.selTarget, this.clsActive, this.clsInactive);
                            trigger(this.$el, 'inactive');
                        }
                    }

                }

            },

            connected: function() {
                this.placeholder = $('+ .uk-sticky-placeholder', this.$el) || $('<div class="uk-sticky-placeholder"></div>');
                this.isFixed = false;
                this.isActive = false;
            },

            disconnected: function() {

                if (this.isFixed) {
                    this.hide();
                    removeClass(this.selTarget, this.clsInactive);
                }

                remove(this.placeholder);
                this.placeholder = null;
                this.widthElement = null;
            },

            events: [

                {

                    name: 'load hashchange popstate',

                    el: window,

                    handler: function() {
                        var this$1 = this;


                        if (!(this.targetOffset !== false && location.hash && window.pageYOffset > 0)) {
                            return;
                        }

                        var target = $(location.hash);

                        if (target) {
                            fastdom.read(function () {

                                var ref = offset(target);
                                var top = ref.top;
                                var elTop = offset(this$1.$el).top;
                                var elHeight = this$1.$el.offsetHeight;

                                if (this$1.isFixed && elTop + elHeight >= top && elTop <= top + target.offsetHeight) {
                                    scrollTop(window, top - elHeight - (isNumeric(this$1.targetOffset) ? this$1.targetOffset : 0) - this$1.offset);
                                }

                            });
                        }

                    }

                }

            ],

            update: [

                {

                    read: function(ref, type) {
                        var height = ref.height;


                        if (this.isActive && type !== 'update') {
                            this.hide();
                            height = this.$el.offsetHeight;
                            this.show();
                        }

                        height = !this.isActive ? this.$el.offsetHeight : height;

                        this.topOffset = offset(this.isFixed ? this.placeholder : this.$el).top;
                        this.bottomOffset = this.topOffset + height;

                        var bottom = parseProp('bottom', this);

                        this.top = Math.max(toFloat(parseProp('top', this)), this.topOffset) - this.offset;
                        this.bottom = bottom && bottom - this.$el.offsetHeight;
                        this.inactive = !this.matchMedia;

                        return {
                            lastScroll: false,
                            height: height,
                            margins: css(this.$el, ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'])
                        };
                    },

                    write: function(ref) {
                        var height = ref.height;
                        var margins = ref.margins;


                        var ref$1 = this;
                        var placeholder = ref$1.placeholder;

                        css(placeholder, assign({height: height}, margins));

                        if (!within(placeholder, document)) {
                            after(this.$el, placeholder);
                            attr(placeholder, 'hidden', '');
                        }

                        // ensure active/inactive classes are applied
                        this.isActive = this.isActive; // eslint-disable-line no-self-assign

                    },

                    events: ['resize']

                },

                {

                    read: function(ref) {
                        var scroll = ref.scroll; if ( scroll === void 0 ) scroll = 0;


                        this.width = offset(isVisible(this.widthElement) ? this.widthElement : this.$el).width;

                        this.scroll = window.pageYOffset;

                        return {
                            dir: scroll <= this.scroll ? 'down' : 'up',
                            scroll: this.scroll,
                            visible: isVisible(this.$el),
                            top: offsetPosition(this.placeholder)[0]
                        };
                    },

                    write: function(data, type) {
                        var this$1 = this;


                        var initTimestamp = data.initTimestamp; if ( initTimestamp === void 0 ) initTimestamp = 0;
                        var dir = data.dir;
                        var lastDir = data.lastDir;
                        var lastScroll = data.lastScroll;
                        var scroll = data.scroll;
                        var top = data.top;
                        var visible = data.visible;
                        var now = performance.now();

                        data.lastScroll = scroll;

                        if (scroll < 0 || scroll === lastScroll || !visible || this.disabled || this.showOnUp && type !== 'scroll') {
                            return;
                        }

                        if (now - initTimestamp > 300 || dir !== lastDir) {
                            data.initScroll = scroll;
                            data.initTimestamp = now;
                        }

                        data.lastDir = dir;

                        if (this.showOnUp && !this.isFixed && Math.abs(data.initScroll - scroll) <= 30 && Math.abs(lastScroll - scroll) <= 10) {
                            return;
                        }

                        if (this.inactive
                            || scroll < this.top
                            || this.showOnUp && (scroll <= this.top || dir === 'down' || dir === 'up' && !this.isFixed && scroll <= this.bottomOffset)
                        ) {

                            if (!this.isFixed) {

                                if (Animation.inProgress(this.$el) && top > scroll) {
                                    Animation.cancel(this.$el);
                                    this.hide();
                                }

                                return;
                            }

                            this.isFixed = false;

                            if (this.animation && scroll > this.topOffset) {
                                Animation.cancel(this.$el);
                                Animation.out(this.$el, this.animation).then(function () { return this$1.hide(); }, noop);
                            } else {
                                this.hide();
                            }

                        } else if (this.isFixed) {

                            this.update();

                        } else if (this.animation) {

                            Animation.cancel(this.$el);
                            this.show();
                            Animation.in(this.$el, this.animation).catch(noop);

                        } else {
                            this.show();
                        }

                    },

                    events: ['resize', 'scroll']

                }

            ],

            methods: {

                show: function() {

                    this.isFixed = true;
                    this.update();
                    attr(this.placeholder, 'hidden', null);

                },

                hide: function() {

                    this.isActive = false;
                    removeClass(this.$el, this.clsFixed, this.clsBelow);
                    css(this.$el, {position: '', top: '', width: ''});
                    attr(this.placeholder, 'hidden', '');

                },

                update: function() {

                    var active = this.top !== 0 || this.scroll > this.top;
                    var top = Math.max(0, this.offset);

                    if (isNumeric(this.bottom) && this.scroll > this.bottom - this.offset) {
                        top = this.bottom - this.scroll;
                    }

                    css(this.$el, {
                        position: 'fixed',
                        top: (top + "px"),
                        width: this.width
                    });

                    this.isActive = active;
                    toggleClass(this.$el, this.clsBelow, this.scroll > this.bottomOffset);
                    addClass(this.$el, this.clsFixed);

                }

            }

        };

        function parseProp(prop, ref) {
            var $props = ref.$props;
            var $el = ref.$el;
            var propOffset = ref[(prop + "Offset")];


            var value = $props[prop];

            if (!value) {
                return;
            }

            if (isString(value) && value.match(/^-?\d/)) {

                return propOffset + toPx(value);

            } else {

                return offset(value === true ? $el.parentNode : query(value, $el)).bottom;

            }
        }

        var Switcher = {

            mixins: [Togglable],

            args: 'connect',

            props: {
                connect: String,
                toggle: String,
                active: Number,
                swiping: Boolean
            },

            data: {
                connect: '~.uk-switcher',
                toggle: '> * > :first-child',
                active: 0,
                swiping: true,
                cls: 'uk-active',
                clsContainer: 'uk-switcher',
                attrItem: 'uk-switcher-item',
                queued: true
            },

            computed: {

                connects: {

                    get: function(ref, $el) {
                        var connect = ref.connect;

                        return queryAll(connect, $el);
                    },

                    watch: function(connects) {
                        var this$1 = this;


                        connects.forEach(function (list) { return this$1.updateAria(list.children); });

                        if (this.swiping) {
                            css(connects, 'touch-action', 'pan-y pinch-zoom');
                        }

                    },

                    immediate: true

                },

                toggles: {

                    get: function(ref, $el) {
                        var toggle = ref.toggle;

                        return $$(toggle, $el).filter(function (el) { return !matches(el, '.uk-disabled *, .uk-disabled, [disabled]'); });
                    },

                    watch: function(toggles) {
                        var active = this.index();
                        this.show(~active && active || toggles[this.active] || toggles[0]);
                    },

                    immediate: true

                }

            },

            events: [

                {

                    name: 'click',

                    delegate: function() {
                        return this.toggle;
                    },

                    handler: function(e) {
                        if (!includes(this.toggles, e.current)) {
                            return;
                        }
                        e.preventDefault();
                        this.show(e.current);
                    }

                },

                {
                    name: 'click',

                    el: function() {
                        return this.connects;
                    },

                    delegate: function() {
                        return ("[" + (this.attrItem) + "],[data-" + (this.attrItem) + "]");
                    },

                    handler: function(e) {
                        e.preventDefault();
                        this.show(data(e.current, this.attrItem));
                    }
                },

                {
                    name: 'swipeRight swipeLeft',

                    filter: function() {
                        return this.swiping;
                    },

                    el: function() {
                        return this.connects;
                    },

                    handler: function(ref) {
                        var type = ref.type;

                        this.show(endsWith(type, 'Left') ? 'next' : 'previous');
                    }
                },

                {
                    name: 'show',

                    el: function() {
                        return this.connects;
                    },

                    handler: function() {
                        var this$1 = this;

                        var index = this.index();

                        this.toggles.forEach(function (toggle, i) {
                            toggleClass(children(this$1.$el).filter(function (el) { return within(toggle, el); }), this$1.cls, index === i);
                            attr(toggle, 'aria-expanded', index === i);
                        });
                    }
                }

            ],

            methods: {

                index: function() {
                    return index(children(this.connects[0], ("." + (this.cls)))[0]);
                },

                show: function(item) {
                    var this$1 = this;


                    var prev = this.index();
                    var next = getIndex(item, this.toggles, prev);

                    this.connects.forEach(function (ref) {
                            var children = ref.children;

                            return this$1.toggleElement([children[prev], children[next]], undefined, prev >= 0);
                    }
                    );
                }

            }

        };

        var tab = {

            mixins: [Class],

            extends: Switcher,

            props: {
                media: Boolean
            },

            data: {
                media: 960,
                attrItem: 'uk-tab-item'
            },

            connected: function() {

                var cls = hasClass(this.$el, 'uk-tab-left')
                    ? 'uk-tab-left'
                    : hasClass(this.$el, 'uk-tab-right')
                        ? 'uk-tab-right'
                        : false;

                if (cls) {
                    this.$create('toggle', this.$el, {cls: cls, mode: 'media', media: this.media});
                }
            }

        };

        var toggle = {

            mixins: [Media, Togglable],

            args: 'target',

            props: {
                href: String,
                target: null,
                mode: 'list'
            },

            data: {
                href: false,
                target: false,
                mode: 'click',
                queued: true
            },

            computed: {

                target: {

                    get: function(ref, $el) {
                        var href = ref.href;
                        var target = ref.target;

                        target = queryAll(target || href, $el);
                        return target.length && target || [$el];
                    },

                    watch: function() {
                        trigger(this.target, 'updatearia', [this]);
                    },

                    immediate: true

                }

            },

            events: [

                {

                    name: (pointerEnter + " " + pointerLeave),

                    filter: function() {
                        return includes(this.mode, 'hover');
                    },

                    handler: function(e) {
                        if (!isTouch(e)) {
                            this.toggle(("toggle" + (e.type === pointerEnter ? 'show' : 'hide')));
                        }
                    }

                },

                {

                    name: 'click',

                    filter: function() {
                        return includes(this.mode, 'click') || hasTouch && includes(this.mode, 'hover');
                    },

                    handler: function(e) {

                        // TODO better isToggled handling
                        var link;
                        if (closest(e.target, 'a[href="#"], a[href=""]')
                            || (link = closest(e.target, 'a[href]')) && (
                                this.cls && !hasClass(this.target, this.cls.split(' ')[0])
                                || !isVisible(this.target)
                                || link.hash && matches(this.target, link.hash)
                            )
                        ) {
                            e.preventDefault();
                        }

                        this.toggle();
                    }

                }

            ],

            update: {

                read: function() {
                    return includes(this.mode, 'media') && this.media
                        ? {match: this.matchMedia}
                        : false;
                },

                write: function(ref) {
                    var match = ref.match;


                    var toggled = this.isToggled(this.target);
                    if (match ? !toggled : toggled) {
                        this.toggle();
                    }

                },

                events: ['resize']

            },

            methods: {

                toggle: function(type) {
                    if (trigger(this.target, type || 'toggle', [this])) {
                        this.toggleElement(this.target);
                    }
                }

            }

        };

        var coreComponents = /*#__PURE__*/Object.freeze({
            __proto__: null,
            Accordion: Accordion,
            Alert: alert,
            Cover: cover,
            Drop: drop,
            Dropdown: drop,
            FormCustom: formCustom,
            Gif: gif,
            Grid: grid,
            HeightMatch: heightMatch,
            HeightViewport: heightViewport,
            Icon: Icon,
            Img: img,
            Leader: leader,
            Margin: Margin,
            Modal: modal,
            Nav: nav,
            Navbar: navbar,
            Offcanvas: offcanvas,
            OverflowAuto: overflowAuto,
            Responsive: responsive,
            Scroll: scroll,
            Scrollspy: scrollspy,
            ScrollspyNav: scrollspyNav,
            Sticky: sticky,
            Svg: SVG,
            Switcher: Switcher,
            Tab: tab,
            Toggle: toggle,
            Video: Video,
            Close: Close,
            Spinner: Spinner,
            SlidenavNext: Slidenav,
            SlidenavPrevious: Slidenav,
            SearchIcon: Search,
            Marker: IconComponent,
            NavbarToggleIcon: IconComponent,
            OverlayIcon: IconComponent,
            PaginationNext: IconComponent,
            PaginationPrevious: IconComponent,
            Totop: IconComponent
        });

        var countdown = {

            mixins: [Class],

            props: {
                date: String,
                clsWrapper: String
            },

            data: {
                date: '',
                clsWrapper: '.uk-countdown-%unit%'
            },

            computed: {

                date: function(ref) {
                    var date = ref.date;

                    return Date.parse(date);
                },

                days: function(ref, $el) {
                    var clsWrapper = ref.clsWrapper;

                    return $(clsWrapper.replace('%unit%', 'days'), $el);
                },

                hours: function(ref, $el) {
                    var clsWrapper = ref.clsWrapper;

                    return $(clsWrapper.replace('%unit%', 'hours'), $el);
                },

                minutes: function(ref, $el) {
                    var clsWrapper = ref.clsWrapper;

                    return $(clsWrapper.replace('%unit%', 'minutes'), $el);
                },

                seconds: function(ref, $el) {
                    var clsWrapper = ref.clsWrapper;

                    return $(clsWrapper.replace('%unit%', 'seconds'), $el);
                },

                units: function() {
                    var this$1 = this;

                    return ['days', 'hours', 'minutes', 'seconds'].filter(function (unit) { return this$1[unit]; });
                }

            },

            connected: function() {
                this.start();
            },

            disconnected: function() {
                var this$1 = this;

                this.stop();
                this.units.forEach(function (unit) { return empty(this$1[unit]); });
            },

            events: [

                {

                    name: 'visibilitychange',

                    el: document,

                    handler: function() {
                        if (document.hidden) {
                            this.stop();
                        } else {
                            this.start();
                        }
                    }

                }

            ],

            update: {

                write: function() {
                    var this$1 = this;


                    var timespan = getTimeSpan(this.date);

                    if (timespan.total <= 0) {

                        this.stop();

                        timespan.days
                            = timespan.hours
                            = timespan.minutes
                            = timespan.seconds
                            = 0;
                    }

                    this.units.forEach(function (unit) {

                        var digits = String(Math.floor(timespan[unit]));

                        digits = digits.length < 2 ? ("0" + digits) : digits;

                        var el = this$1[unit];
                        if (el.textContent !== digits) {
                            digits = digits.split('');

                            if (digits.length !== el.children.length) {
                                html(el, digits.map(function () { return '<span></span>'; }).join(''));
                            }

                            digits.forEach(function (digit, i) { return el.children[i].textContent = digit; });
                        }

                    });

                }

            },

            methods: {

                start: function() {

                    this.stop();

                    if (this.date && this.units.length) {
                        this.$update();
                        this.timer = setInterval(this.$update, 1000);
                    }

                },

                stop: function() {

                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }

                }

            }

        };

        function getTimeSpan(date) {

            var total = date - Date.now();

            return {
                total: total,
                seconds: total / 1000 % 60,
                minutes: total / 1000 / 60 % 60,
                hours: total / 1000 / 60 / 60 % 24,
                days: total / 1000 / 60 / 60 / 24
            };
        }

        var targetClass = 'uk-animation-target';

        var Animate = {

            props: {
                animation: Number
            },

            data: {
                animation: 150
            },

            computed: {

                target: function() {
                    return this.$el;
                }

            },

            methods: {

                animate: function(action) {
                    var this$1 = this;


                    addStyle();

                    var children$1 = children(this.target);
                    var propsFrom = children$1.map(function (el) { return getProps(el, true); });

                    var oldHeight = height(this.target);
                    var oldScrollY = window.pageYOffset;

                    action();

                    Transition.cancel(this.target);
                    children$1.forEach(Transition.cancel);

                    reset(this.target);
                    this.$update(this.target, 'resize');
                    fastdom.flush();

                    var newHeight = height(this.target);

                    children$1 = children$1.concat(children(this.target).filter(function (el) { return !includes(children$1, el); }));

                    var propsTo = children$1.map(function (el, i) { return el.parentNode && i in propsFrom
                            ? propsFrom[i]
                            ? isVisible(el)
                                ? getPositionWithMargin(el)
                                : {opacity: 0}
                            : {opacity: isVisible(el) ? 1 : 0}
                            : false; }
                    );

                    propsFrom = propsTo.map(function (props, i) {
                        var from = children$1[i].parentNode === this$1.target
                            ? propsFrom[i] || getProps(children$1[i])
                            : false;

                        if (from) {
                            if (!props) {
                                delete from.opacity;
                            } else if (!('opacity' in props)) {
                                var opacity = from.opacity;

                                if (opacity % 1) {
                                    props.opacity = 1;
                                } else {
                                    delete from.opacity;
                                }
                            }
                        }

                        return from;
                    });

                    addClass(this.target, targetClass);
                    children$1.forEach(function (el, i) { return propsFrom[i] && css(el, propsFrom[i]); });
                    css(this.target, {height: oldHeight, display: 'block'});
                    scrollTop(window, oldScrollY);

                    return Promise.all(
                        children$1.map(function (el, i) { return ['top', 'left', 'height', 'width'].some(function (prop) { return propsFrom[i][prop] !== propsTo[i][prop]; }
                            ) && Transition.start(el, propsTo[i], this$1.animation, 'ease'); }
                        ).concat(oldHeight !== newHeight && Transition.start(this.target, {height: newHeight}, this.animation, 'ease'))
                    ).then(function () {
                        children$1.forEach(function (el, i) { return css(el, {display: propsTo[i].opacity === 0 ? 'none' : '', zIndex: ''}); });
                        reset(this$1.target);
                        this$1.$update(this$1.target, 'resize');
                        fastdom.flush(); // needed for IE11
                    }, noop);

                }
            }
        };

        function getProps(el, opacity) {

            var zIndex = css(el, 'zIndex');

            return isVisible(el)
                ? assign({
                    display: '',
                    opacity: opacity ? css(el, 'opacity') : '0',
                    pointerEvents: 'none',
                    position: 'absolute',
                    zIndex: zIndex === 'auto' ? index(el) : zIndex
                }, getPositionWithMargin(el))
                : false;
        }

        function reset(el) {
            css(el.children, {
                height: '',
                left: '',
                opacity: '',
                pointerEvents: '',
                position: '',
                top: '',
                width: ''
            });
            removeClass(el, targetClass);
            css(el, {height: '', display: ''});
        }

        function getPositionWithMargin(el) {
            var ref = offset(el);
            var height = ref.height;
            var width = ref.width;
            var ref$1 = position(el);
            var top = ref$1.top;
            var left = ref$1.left;

            return {top: top, left: left, height: height, width: width};
        }

        var style;

        function addStyle() {
            if (style) {
                return;
            }
            style = append(document.head, '<style>').sheet;
            style.insertRule(
                ("." + targetClass + " > * {\n            margin-top: 0 !important;\n            transform: none !important;\n        }"), 0
            );
        }

        var filter$1 = {

            mixins: [Animate],

            args: 'target',

            props: {
                target: Boolean,
                selActive: Boolean
            },

            data: {
                target: null,
                selActive: false,
                attrItem: 'uk-filter-control',
                cls: 'uk-active',
                animation: 250
            },

            computed: {

                toggles: {

                    get: function(ref, $el) {
                        var attrItem = ref.attrItem;

                        return $$(("[" + (this.attrItem) + "],[data-" + (this.attrItem) + "]"), $el);
                    },

                    watch: function() {
                        var this$1 = this;


                        this.updateState();

                        if (this.selActive !== false) {
                            var actives = $$(this.selActive, this.$el);
                            this.toggles.forEach(function (el) { return toggleClass(el, this$1.cls, includes(actives, el)); });
                        }

                    },

                    immediate: true

                },

                target: function(ref, $el) {
                    var target = ref.target;

                    return $(target, $el);
                },

                children: {

                    get: function() {
                        return children(this.target);
                    },

                    watch: function(list, old) {
                        if (!isEqualList(list, old)) {
                            this.updateState();
                        }
                    }
                }

            },

            events: [

                {

                    name: 'click',

                    delegate: function() {
                        return ("[" + (this.attrItem) + "],[data-" + (this.attrItem) + "]");
                    },

                    handler: function(e) {

                        e.preventDefault();
                        this.apply(e.current);

                    }

                }

            ],

            methods: {

                apply: function(el) {
                    this.setState(mergeState(el, this.attrItem, this.getState()));
                },

                getState: function() {
                    var this$1 = this;

                    return this.toggles
                        .filter(function (item) { return hasClass(item, this$1.cls); })
                        .reduce(function (state, el) { return mergeState(el, this$1.attrItem, state); }, {filter: {'': ''}, sort: []});
                },

                setState: function(state, animate) {
                    var this$1 = this;
                    if ( animate === void 0 ) animate = true;


                    state = assign({filter: {'': ''}, sort: []}, state);

                    trigger(this.$el, 'beforeFilter', [this, state]);

                    var ref = this;
                    var children = ref.children;

                    this.toggles.forEach(function (el) { return toggleClass(el, this$1.cls, !!matchFilter(el, this$1.attrItem, state)); });

                    var apply = function () {

                        var selector = getSelector(state);

                        children.forEach(function (el) { return css(el, 'display', selector && !matches(el, selector) ? 'none' : ''); });

                        var ref = state.sort;
                        var sort = ref[0];
                        var order = ref[1];

                        if (sort) {
                            var sorted = sortItems(children, sort, order);
                            if (!isEqual(sorted, children)) {
                                sorted.forEach(function (el) { return append(this$1.target, el); });
                            }
                        }

                    };

                    if (animate) {
                        this.animate(apply).then(function () { return trigger(this$1.$el, 'afterFilter', [this$1]); });
                    } else {
                        apply();
                        trigger(this.$el, 'afterFilter', [this]);
                    }

                },

                updateState: function() {
                    var this$1 = this;

                    fastdom.write(function () { return this$1.setState(this$1.getState(), false); });
                }

            }

        };

        function getFilter(el, attr) {
            return parseOptions(data(el, attr), ['filter']);
        }

        function mergeState(el, attr, state) {

            var filterBy = getFilter(el, attr);
            var filter = filterBy.filter;
            var group = filterBy.group;
            var sort = filterBy.sort;
            var order = filterBy.order; if ( order === void 0 ) order = 'asc';

            if (filter || isUndefined(sort)) {

                if (group) {

                    if (filter) {
                        delete state.filter[''];
                        state.filter[group] = filter;
                    } else {
                        delete state.filter[group];

                        if (isEmpty(state.filter) || '' in state.filter) {
                            state.filter = {'': filter || ''};
                        }

                    }

                } else {
                    state.filter = {'': filter || ''};
                }

            }

            if (!isUndefined(sort)) {
                state.sort = [sort, order];
            }

            return state;
        }

        function matchFilter(el, attr, ref) {
            var stateFilter = ref.filter; if ( stateFilter === void 0 ) stateFilter = {'': ''};
            var ref_sort = ref.sort;
            var stateSort = ref_sort[0];
            var stateOrder = ref_sort[1];


            var ref$1 = getFilter(el, attr);
            var filter = ref$1.filter; if ( filter === void 0 ) filter = '';
            var group = ref$1.group; if ( group === void 0 ) group = '';
            var sort = ref$1.sort;
            var order = ref$1.order; if ( order === void 0 ) order = 'asc';

            return isUndefined(sort)
                ? group in stateFilter && filter === stateFilter[group]
                    || !filter && group && !(group in stateFilter) && !stateFilter['']
                : stateSort === sort && stateOrder === order;
        }

        function isEqualList(listA, listB) {
            return listA.length === listB.length
                && listA.every(function (el) { return ~listB.indexOf(el); });
        }

        function getSelector(ref) {
            var filter = ref.filter;

            var selector = '';
            each(filter, function (value) { return selector += value || ''; });
            return selector;
        }

        function sortItems(nodes, sort, order) {
            return assign([], nodes).sort(function (a, b) { return data(a, sort).localeCompare(data(b, sort), undefined, {numeric: true}) * (order === 'asc' || -1); });
        }

        var Animations = {

            slide: {

                show: function(dir) {
                    return [
                        {transform: translate(dir * -100)},
                        {transform: translate()}
                    ];
                },

                percent: function(current) {
                    return translated(current);
                },

                translate: function(percent, dir) {
                    return [
                        {transform: translate(dir * -100 * percent)},
                        {transform: translate(dir * 100 * (1 - percent))}
                    ];
                }

            }

        };

        function translated(el) {
            return Math.abs(css(el, 'transform').split(',')[4] / el.offsetWidth) || 0;
        }

        function translate(value, unit) {
            if ( value === void 0 ) value = 0;
            if ( unit === void 0 ) unit = '%';

            value += value ? unit : '';
            return isIE ? ("translateX(" + value + ")") : ("translate3d(" + value + ", 0, 0)"); // currently not translate3d in IE, translate3d within translate3d does not work while transitioning
        }

        function scale3d(value) {
            return ("scale3d(" + value + ", " + value + ", 1)");
        }

        var Animations$1 = assign({}, Animations, {

            fade: {

                show: function() {
                    return [
                        {opacity: 0},
                        {opacity: 1}
                    ];
                },

                percent: function(current) {
                    return 1 - css(current, 'opacity');
                },

                translate: function(percent) {
                    return [
                        {opacity: 1 - percent},
                        {opacity: percent}
                    ];
                }

            },

            scale: {

                show: function() {
                    return [
                        {opacity: 0, transform: scale3d(1 - .2)},
                        {opacity: 1, transform: scale3d(1)}
                    ];
                },

                percent: function(current) {
                    return 1 - css(current, 'opacity');
                },

                translate: function(percent) {
                    return [
                        {opacity: 1 - percent, transform: scale3d(1 - .2 * percent)},
                        {opacity: percent, transform: scale3d(1 - .2 + .2 * percent)}
                    ];
                }

            }

        });

        function Transitioner(prev, next, dir, ref) {
            var animation = ref.animation;
            var easing = ref.easing;


            var percent = animation.percent;
            var translate = animation.translate;
            var show = animation.show; if ( show === void 0 ) show = noop;
            var props = show(dir);
            var deferred = new Deferred();

            return {

                dir: dir,

                show: function(duration, percent, linear) {
                    var this$1 = this;
                    if ( percent === void 0 ) percent = 0;


                    var timing = linear ? 'linear' : easing;
                    duration -= Math.round(duration * clamp(percent, -1, 1));

                    this.translate(percent);

                    triggerUpdate(next, 'itemin', {percent: percent, duration: duration, timing: timing, dir: dir});
                    triggerUpdate(prev, 'itemout', {percent: 1 - percent, duration: duration, timing: timing, dir: dir});

                    Promise.all([
                        Transition.start(next, props[1], duration, timing),
                        Transition.start(prev, props[0], duration, timing)
                    ]).then(function () {
                        this$1.reset();
                        deferred.resolve();
                    }, noop);

                    return deferred.promise;
                },

                stop: function() {
                    return Transition.stop([next, prev]);
                },

                cancel: function() {
                    Transition.cancel([next, prev]);
                },

                reset: function() {
                    for (var prop in props[0]) {
                        css([next, prev], prop, '');
                    }
                },

                forward: function(duration, percent) {
                    if ( percent === void 0 ) percent = this.percent();

                    Transition.cancel([next, prev]);
                    return this.show(duration, percent, true);

                },

                translate: function(percent) {

                    this.reset();

                    var props = translate(percent, dir);
                    css(next, props[1]);
                    css(prev, props[0]);
                    triggerUpdate(next, 'itemtranslatein', {percent: percent, dir: dir});
                    triggerUpdate(prev, 'itemtranslateout', {percent: 1 - percent, dir: dir});

                },

                percent: function() {
                    return percent(prev || next, next, dir);
                },

                getDistance: function() {
                    return prev && prev.offsetWidth;
                }

            };

        }

        function triggerUpdate(el, type, data) {
            trigger(el, createEvent(type, false, false, data));
        }

        var SliderAutoplay = {

            props: {
                autoplay: Boolean,
                autoplayInterval: Number,
                pauseOnHover: Boolean
            },

            data: {
                autoplay: false,
                autoplayInterval: 7000,
                pauseOnHover: true
            },

            connected: function() {
                this.autoplay && this.startAutoplay();
            },

            disconnected: function() {
                this.stopAutoplay();
            },

            update: function() {
                attr(this.slides, 'tabindex', '-1');
            },

            events: [

                {

                    name: 'visibilitychange',

                    el: document,

                    filter: function() {
                        return this.autoplay;
                    },

                    handler: function() {
                        if (document.hidden) {
                            this.stopAutoplay();
                        } else {
                            this.startAutoplay();
                        }
                    }

                }

            ],

            methods: {

                startAutoplay: function() {
                    var this$1 = this;


                    this.stopAutoplay();

                    this.interval = setInterval(
                        function () { return (!this$1.draggable || !$(':focus', this$1.$el))
                            && (!this$1.pauseOnHover || !matches(this$1.$el, ':hover'))
                            && !this$1.stack.length
                            && this$1.show('next'); },
                        this.autoplayInterval
                    );

                },

                stopAutoplay: function() {
                    this.interval && clearInterval(this.interval);
                }

            }

        };

        var SliderDrag = {

            props: {
                draggable: Boolean
            },

            data: {
                draggable: true,
                threshold: 10
            },

            created: function() {
                var this$1 = this;


                ['start', 'move', 'end'].forEach(function (key) {

                    var fn = this$1[key];
                    this$1[key] = function (e) {

                        var pos = getEventPos(e).x * (isRtl ? -1 : 1);

                        this$1.prevPos = pos !== this$1.pos ? this$1.pos : this$1.prevPos;
                        this$1.pos = pos;

                        fn(e);
                    };

                });

            },

            events: [

                {

                    name: pointerDown,

                    delegate: function() {
                        return this.selSlides;
                    },

                    handler: function(e) {

                        if (!this.draggable
                            || !isTouch(e) && hasTextNodesOnly(e.target)
                            || closest(e.target, selInput)
                            || e.button > 0
                            || this.length < 2
                        ) {
                            return;
                        }

                        this.start(e);
                    }

                },

                {

                    // Workaround for iOS 11 bug: https://bugs.webkit.org/show_bug.cgi?id=184250

                    name: 'touchmove',
                    passive: false,
                    handler: 'move',
                    filter: function() {
                        return pointerMove === 'touchmove';
                    },
                    delegate: function() {
                        return this.selSlides;
                    }

                },

                {
                    name: 'dragstart',

                    handler: function(e) {
                        e.preventDefault();
                    }
                }

            ],

            methods: {

                start: function() {
                    var this$1 = this;


                    this.drag = this.pos;

                    if (this._transitioner) {

                        this.percent = this._transitioner.percent();
                        this.drag += this._transitioner.getDistance() * this.percent * this.dir;

                        this._transitioner.cancel();
                        this._transitioner.translate(this.percent);

                        this.dragging = true;

                        this.stack = [];

                    } else {
                        this.prevIndex = this.index;
                    }

                    // See above workaround notice
                    var off = pointerMove !== 'touchmove'
                        ? on(document, pointerMove, this.move, {passive: false})
                        : noop;
                    this.unbindMove = function () {
                        off();
                        this$1.unbindMove = null;
                    };
                    on(window, 'scroll', this.unbindMove);
                    on(window.visualViewport, 'resize', this.unbindMove);
                    on(document, (pointerUp + " " + pointerCancel), this.end, true);

                    css(this.list, 'userSelect', 'none');

                },

                move: function(e) {
                    var this$1 = this;


                    // See above workaround notice
                    if (!this.unbindMove) {
                        return;
                    }

                    var distance = this.pos - this.drag;

                    if (distance === 0 || this.prevPos === this.pos || !this.dragging && Math.abs(distance) < this.threshold) {
                        return;
                    }

                    css(this.list, 'pointerEvents', 'none');

                    e.cancelable && e.preventDefault();

                    this.dragging = true;
                    this.dir = (distance < 0 ? 1 : -1);

                    var ref = this;
                    var slides = ref.slides;
                    var ref$1 = this;
                    var prevIndex = ref$1.prevIndex;
                    var dis = Math.abs(distance);
                    var nextIndex = this.getIndex(prevIndex + this.dir, prevIndex);
                    var width = this._getDistance(prevIndex, nextIndex) || slides[prevIndex].offsetWidth;

                    while (nextIndex !== prevIndex && dis > width) {

                        this.drag -= width * this.dir;

                        prevIndex = nextIndex;
                        dis -= width;
                        nextIndex = this.getIndex(prevIndex + this.dir, prevIndex);
                        width = this._getDistance(prevIndex, nextIndex) || slides[prevIndex].offsetWidth;

                    }

                    this.percent = dis / width;

                    var prev = slides[prevIndex];
                    var next = slides[nextIndex];
                    var changed = this.index !== nextIndex;
                    var edge = prevIndex === nextIndex;

                    var itemShown;

                    [this.index, this.prevIndex].filter(function (i) { return !includes([nextIndex, prevIndex], i); }).forEach(function (i) {
                        trigger(slides[i], 'itemhidden', [this$1]);

                        if (edge) {
                            itemShown = true;
                            this$1.prevIndex = prevIndex;
                        }

                    });

                    if (this.index === prevIndex && this.prevIndex !== prevIndex || itemShown) {
                        trigger(slides[this.index], 'itemshown', [this]);
                    }

                    if (changed) {
                        this.prevIndex = prevIndex;
                        this.index = nextIndex;

                        !edge && trigger(prev, 'beforeitemhide', [this]);
                        trigger(next, 'beforeitemshow', [this]);
                    }

                    this._transitioner = this._translate(Math.abs(this.percent), prev, !edge && next);

                    if (changed) {
                        !edge && trigger(prev, 'itemhide', [this]);
                        trigger(next, 'itemshow', [this]);
                    }

                },

                end: function() {

                    off(window, 'scroll', this.unbindMove);
                    off(window.visualViewport, 'resize', this.unbindMove);
                    this.unbindMove && this.unbindMove();
                    off(document, pointerUp, this.end, true);

                    if (this.dragging) {

                        this.dragging = null;

                        if (this.index === this.prevIndex) {
                            this.percent = 1 - this.percent;
                            this.dir *= -1;
                            this._show(false, this.index, true);
                            this._transitioner = null;
                        } else {

                            var dirChange = (isRtl ? this.dir * (isRtl ? 1 : -1) : this.dir) < 0 === this.prevPos > this.pos;
                            this.index = dirChange ? this.index : this.prevIndex;

                            if (dirChange) {
                                this.percent = 1 - this.percent;
                            }

                            this.show(this.dir > 0 && !dirChange || this.dir < 0 && dirChange ? 'next' : 'previous', true);
                        }

                    }

                    css(this.list, {userSelect: '', pointerEvents: ''});

                    this.drag
                        = this.percent
                        = null;

                }

            }

        };

        function hasTextNodesOnly(el) {
            return !el.children.length && el.childNodes.length;
        }

        var SliderNav = {

            data: {
                selNav: false
            },

            computed: {

                nav: function(ref, $el) {
                    var selNav = ref.selNav;

                    return $(selNav, $el);
                },

                selNavItem: function(ref) {
                    var attrItem = ref.attrItem;

                    return ("[" + attrItem + "],[data-" + attrItem + "]");
                },

                navItems: function(_, $el) {
                    return $$(this.selNavItem, $el);
                }

            },

            update: {

                write: function() {
                    var this$1 = this;


                    if (this.nav && this.length !== this.nav.children.length) {
                        html(this.nav, this.slides.map(function (_, i) { return ("<li " + (this$1.attrItem) + "=\"" + i + "\"><a href></a></li>"); }).join(''));
                    }

                    toggleClass($$(this.selNavItem, this.$el).concat(this.nav), 'uk-hidden', !this.maxIndex);

                    this.updateNav();

                },

                events: ['resize']

            },

            events: [

                {

                    name: 'click',

                    delegate: function() {
                        return this.selNavItem;
                    },

                    handler: function(e) {
                        e.preventDefault();
                        this.show(data(e.current, this.attrItem));
                    }

                },

                {

                    name: 'itemshow',
                    handler: 'updateNav'

                }

            ],

            methods: {

                updateNav: function() {
                    var this$1 = this;


                    var i = this.getValidIndex();
                    this.navItems.forEach(function (el) {

                        var cmd = data(el, this$1.attrItem);

                        toggleClass(el, this$1.clsActive, toNumber(cmd) === i);
                        toggleClass(el, 'uk-invisible', this$1.finite && (cmd === 'previous' && i === 0 || cmd === 'next' && i >= this$1.maxIndex));
                    });

                }

            }

        };

        var Slider = {

            mixins: [SliderAutoplay, SliderDrag, SliderNav],

            props: {
                clsActivated: Boolean,
                easing: String,
                index: Number,
                finite: Boolean,
                velocity: Number,
                selSlides: String
            },

            data: function () { return ({
                easing: 'ease',
                finite: false,
                velocity: 1,
                index: 0,
                prevIndex: -1,
                stack: [],
                percent: 0,
                clsActive: 'uk-active',
                clsActivated: false,
                Transitioner: false,
                transitionOptions: {}
            }); },

            connected: function() {
                this.prevIndex = -1;
                this.index = this.getValidIndex(this.index);
                this.stack = [];
            },

            disconnected: function() {
                removeClass(this.slides, this.clsActive);
            },

            computed: {

                duration: function(ref, $el) {
                    var velocity = ref.velocity;

                    return speedUp($el.offsetWidth / velocity);
                },

                list: function(ref, $el) {
                    var selList = ref.selList;

                    return $(selList, $el);
                },

                maxIndex: function() {
                    return this.length - 1;
                },

                selSlides: function(ref) {
                    var selList = ref.selList;
                    var selSlides = ref.selSlides;

                    return (selList + " " + (selSlides || '> *'));
                },

                slides: {

                    get: function() {
                        return $$(this.selSlides, this.$el);
                    },

                    watch: function() {
                        this.$reset();
                    }

                },

                length: function() {
                    return this.slides.length;
                }

            },

            events: {

                itemshown: function() {
                    this.$update(this.list);
                }

            },

            methods: {

                show: function(index, force) {
                    var this$1 = this;
                    if ( force === void 0 ) force = false;


                    if (this.dragging || !this.length) {
                        return;
                    }

                    var ref = this;
                    var stack = ref.stack;
                    var queueIndex = force ? 0 : stack.length;
                    var reset = function () {
                        stack.splice(queueIndex, 1);

                        if (stack.length) {
                            this$1.show(stack.shift(), true);
                        }
                    };

                    stack[force ? 'unshift' : 'push'](index);

                    if (!force && stack.length > 1) {

                        if (stack.length === 2) {
                            this._transitioner.forward(Math.min(this.duration, 200));
                        }

                        return;
                    }

                    var prevIndex = this.getIndex(this.index);
                    var prev = hasClass(this.slides, this.clsActive) && this.slides[prevIndex];
                    var nextIndex = this.getIndex(index, this.index);
                    var next = this.slides[nextIndex];

                    if (prev === next) {
                        reset();
                        return;
                    }

                    this.dir = getDirection(index, prevIndex);
                    this.prevIndex = prevIndex;
                    this.index = nextIndex;

                    if (prev && !trigger(prev, 'beforeitemhide', [this])
                        || !trigger(next, 'beforeitemshow', [this, prev])
                    ) {
                        this.index = this.prevIndex;
                        reset();
                        return;
                    }

                    var promise = this._show(prev, next, force).then(function () {

                        prev && trigger(prev, 'itemhidden', [this$1]);
                        trigger(next, 'itemshown', [this$1]);

                        return new Promise(function (resolve) {
                            fastdom.write(function () {
                                stack.shift();
                                if (stack.length) {
                                    this$1.show(stack.shift(), true);
                                } else {
                                    this$1._transitioner = null;
                                }
                                resolve();
                            });
                        });

                    });

                    prev && trigger(prev, 'itemhide', [this]);
                    trigger(next, 'itemshow', [this]);

                    return promise;

                },

                getIndex: function(index, prev) {
                    if ( index === void 0 ) index = this.index;
                    if ( prev === void 0 ) prev = this.index;

                    return clamp(getIndex(index, this.slides, prev, this.finite), 0, this.maxIndex);
                },

                getValidIndex: function(index, prevIndex) {
                    if ( index === void 0 ) index = this.index;
                    if ( prevIndex === void 0 ) prevIndex = this.prevIndex;

                    return this.getIndex(index, prevIndex);
                },

                _show: function(prev, next, force) {

                    this._transitioner = this._getTransitioner(
                        prev,
                        next,
                        this.dir,
                        assign({
                            easing: force
                                ? next.offsetWidth < 600
                                    ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' /* easeOutQuad */
                                    : 'cubic-bezier(0.165, 0.84, 0.44, 1)' /* easeOutQuart */
                                : this.easing
                        }, this.transitionOptions)
                    );

                    if (!force && !prev) {
                        this._translate(1);
                        return Promise.resolve();
                    }

                    var ref = this.stack;
                    var length = ref.length;
                    return this._transitioner[length > 1 ? 'forward' : 'show'](length > 1 ? Math.min(this.duration, 75 + 75 / (length - 1)) : this.duration, this.percent);

                },

                _getDistance: function(prev, next) {
                    return this._getTransitioner(prev, prev !== next && next).getDistance();
                },

                _translate: function(percent, prev, next) {
                    if ( prev === void 0 ) prev = this.prevIndex;
                    if ( next === void 0 ) next = this.index;

                    var transitioner = this._getTransitioner(prev !== next ? prev : false, next);
                    transitioner.translate(percent);
                    return transitioner;
                },

                _getTransitioner: function(prev, next, dir, options) {
                    if ( prev === void 0 ) prev = this.prevIndex;
                    if ( next === void 0 ) next = this.index;
                    if ( dir === void 0 ) dir = this.dir || 1;
                    if ( options === void 0 ) options = this.transitionOptions;

                    return new this.Transitioner(
                        isNumber(prev) ? this.slides[prev] : prev,
                        isNumber(next) ? this.slides[next] : next,
                        dir * (isRtl ? -1 : 1),
                        options
                    );
                }

            }

        };

        function getDirection(index, prevIndex) {
            return index === 'next'
                ? 1
                : index === 'previous'
                    ? -1
                    : index < prevIndex
                        ? -1
                        : 1;
        }

        function speedUp(x) {
            return .5 * x + 300; // parabola through (400,500; 600,600; 1800,1200)
        }

        var Slideshow = {

            mixins: [Slider],

            props: {
                animation: String
            },

            data: {
                animation: 'slide',
                clsActivated: 'uk-transition-active',
                Animations: Animations,
                Transitioner: Transitioner
            },

            computed: {

                animation: function(ref) {
                    var animation = ref.animation;
                    var Animations = ref.Animations;

                    return assign(Animations[animation] || Animations.slide, {name: animation});
                },

                transitionOptions: function() {
                    return {animation: this.animation};
                }

            },

            events: {

                'itemshow itemhide itemshown itemhidden': function(ref) {
                    var target = ref.target;

                    this.$update(target);
                },

                beforeitemshow: function(ref) {
                    var target = ref.target;

                    addClass(target, this.clsActive);
                },

                itemshown: function(ref) {
                    var target = ref.target;

                    addClass(target, this.clsActivated);
                },

                itemhidden: function(ref) {
                    var target = ref.target;

                    removeClass(target, this.clsActive, this.clsActivated);
                }

            }

        };

        var LightboxPanel = {

            mixins: [Container, Modal, Togglable, Slideshow],

            functional: true,

            props: {
                delayControls: Number,
                preload: Number,
                videoAutoplay: Boolean,
                template: String
            },

            data: function () { return ({
                preload: 1,
                videoAutoplay: false,
                delayControls: 3000,
                items: [],
                cls: 'uk-open',
                clsPage: 'uk-lightbox-page',
                selList: '.uk-lightbox-items',
                attrItem: 'uk-lightbox-item',
                selClose: '.uk-close-large',
                selCaption: '.uk-lightbox-caption',
                pauseOnHover: false,
                velocity: 2,
                Animations: Animations$1,
                template: "<div class=\"uk-lightbox uk-overflow-hidden\"> <ul class=\"uk-lightbox-items\"></ul> <div class=\"uk-lightbox-toolbar uk-position-top uk-text-right uk-transition-slide-top uk-transition-opaque\"> <button class=\"uk-lightbox-toolbar-icon uk-close-large\" type=\"button\" uk-close></button> </div> <a class=\"uk-lightbox-button uk-position-center-left uk-position-medium uk-transition-fade\" href uk-slidenav-previous uk-lightbox-item=\"previous\"></a> <a class=\"uk-lightbox-button uk-position-center-right uk-position-medium uk-transition-fade\" href uk-slidenav-next uk-lightbox-item=\"next\"></a> <div class=\"uk-lightbox-toolbar uk-lightbox-caption uk-position-bottom uk-text-center uk-transition-slide-bottom uk-transition-opaque\"></div> </div>"
            }); },

            created: function() {

                var $el = $(this.template);
                var list = $(this.selList, $el);
                this.items.forEach(function () { return append(list, '<li>'); });

                this.$mount(append(this.container, $el));

            },

            computed: {

                caption: function(ref, $el) {
                    var selCaption = ref.selCaption;

                    return $('.uk-lightbox-caption', $el);
                }

            },

            events: [

                {

                    name: (pointerMove + " " + pointerDown + " keydown"),

                    handler: 'showControls'

                },

                {

                    name: 'click',

                    self: true,

                    delegate: function() {
                        return this.selSlides;
                    },

                    handler: function(e) {

                        if (e.defaultPrevented) {
                            return;
                        }

                        this.hide();
                    }

                },

                {

                    name: 'shown',

                    self: true,

                    handler: function() {
                        this.showControls();
                    }

                },

                {

                    name: 'hide',

                    self: true,

                    handler: function() {

                        this.hideControls();

                        removeClass(this.slides, this.clsActive);
                        Transition.stop(this.slides);

                    }
                },

                {

                    name: 'hidden',

                    self: true,

                    handler: function() {
                        this.$destroy(true);
                    }

                },

                {

                    name: 'keyup',

                    el: document,

                    handler: function(e) {

                        if (!this.isToggled(this.$el) || !this.draggable) {
                            return;
                        }

                        switch (e.keyCode) {
                            case 37:
                                this.show('previous');
                                break;
                            case 39:
                                this.show('next');
                                break;
                        }
                    }
                },

                {

                    name: 'beforeitemshow',

                    handler: function(e) {

                        if (this.isToggled()) {
                            return;
                        }

                        this.draggable = false;

                        e.preventDefault();

                        this.toggleElement(this.$el, true, false);

                        this.animation = Animations$1['scale'];
                        removeClass(e.target, this.clsActive);
                        this.stack.splice(1, 0, this.index);

                    }

                },

                {

                    name: 'itemshow',

                    handler: function() {

                        html(this.caption, this.getItem().caption || '');

                        for (var j = -this.preload; j <= this.preload; j++) {
                            this.loadItem(this.index + j);
                        }

                    }

                },

                {

                    name: 'itemshown',

                    handler: function() {
                        this.draggable = this.$props.draggable;
                    }

                },

                {

                    name: 'itemload',

                    handler: function(_, item) {
                        var this$1 = this;


                        var src = item.source;
                        var type = item.type;
                        var alt = item.alt; if ( alt === void 0 ) alt = '';
                        var poster = item.poster;
                        var attrs = item.attrs; if ( attrs === void 0 ) attrs = {};

                        this.setItem(item, '<span uk-spinner></span>');

                        if (!src) {
                            return;
                        }

                        var matches;
                        var iframeAttrs = {
                            frameborder: '0',
                            allow: 'autoplay',
                            allowfullscreen: '',
                            style: 'max-width: 100%; box-sizing: border-box;',
                            'uk-responsive': '',
                            'uk-video': ("" + (this.videoAutoplay))
                        };

                        // Image
                        if (type === 'image' || src.match(/\.(jpe?g|png|gif|svg|webp)($|\?)/i)) {

                            getImage(src, attrs.srcset, attrs.size).then(
                                function (ref) {
                                    var width = ref.width;
                                    var height = ref.height;

                                    return this$1.setItem(item, createEl('img', assign({src: src, width: width, height: height, alt: alt}, attrs)));
                            },
                                function () { return this$1.setError(item); }
                            );

                        // Video
                        } else if (type === 'video' || src.match(/\.(mp4|webm|ogv)($|\?)/i)) {

                            var video = createEl('video', assign({
                                src: src,
                                poster: poster,
                                controls: '',
                                playsinline: '',
                                'uk-video': ("" + (this.videoAutoplay))
                            }, attrs));

                            on(video, 'loadedmetadata', function () {
                                attr(video, {width: video.videoWidth, height: video.videoHeight});
                                this$1.setItem(item, video);
                            });
                            on(video, 'error', function () { return this$1.setError(item); });

                        // Iframe
                        } else if (type === 'iframe' || src.match(/\.(html|php)($|\?)/i)) {

                            this.setItem(item, createEl('iframe', assign({
                                src: src,
                                frameborder: '0',
                                allowfullscreen: '',
                                class: 'uk-lightbox-iframe'
                            }, attrs)));

                        // YouTube
                        } else if ((matches = src.match(/\/\/(?:.*?youtube(-nocookie)?\..*?[?&]v=|youtu\.be\/)([\w-]{11})[&?]?(.*)?/))) {

                            this.setItem(item, createEl('iframe', assign({
                                src: ("https://www.youtube" + (matches[1] || '') + ".com/embed/" + (matches[2]) + (matches[3] ? ("?" + (matches[3])) : '')),
                                width: 1920,
                                height: 1080
                            }, iframeAttrs, attrs)));

                        // Vimeo
                        } else if ((matches = src.match(/\/\/.*?vimeo\.[a-z]+\/(\d+)[&?]?(.*)?/))) {

                            ajax(("https://vimeo.com/api/oembed.json?maxwidth=1920&url=" + (encodeURI(src))), {
                                responseType: 'json',
                                withCredentials: false
                            }).then(
                                function (ref) {
                                    var ref_response = ref.response;
                                    var height = ref_response.height;
                                    var width = ref_response.width;

                                    return this$1.setItem(item, createEl('iframe', assign({
                                    src: ("https://player.vimeo.com/video/" + (matches[1]) + (matches[2] ? ("?" + (matches[2])) : '')),
                                    width: width,
                                    height: height
                                }, iframeAttrs, attrs)));
                            },
                                function () { return this$1.setError(item); }
                            );

                        }

                    }

                }

            ],

            methods: {

                loadItem: function(index) {
                    if ( index === void 0 ) index = this.index;


                    var item = this.getItem(index);

                    if (!this.getSlide(item).childElementCount) {
                        trigger(this.$el, 'itemload', [item]);
                    }
                },

                getItem: function(index) {
                    if ( index === void 0 ) index = this.index;

                    return this.items[getIndex(index, this.slides)];
                },

                setItem: function(item, content) {
                    trigger(this.$el, 'itemloaded', [this, html(this.getSlide(item), content) ]);
                },

                getSlide: function(item) {
                    return this.slides[this.items.indexOf(item)];
                },

                setError: function(item) {
                    this.setItem(item, '<span uk-icon="icon: bolt; ratio: 2"></span>');
                },

                showControls: function() {

                    clearTimeout(this.controlsTimer);
                    this.controlsTimer = setTimeout(this.hideControls, this.delayControls);

                    addClass(this.$el, 'uk-active', 'uk-transition-active');

                },

                hideControls: function() {
                    removeClass(this.$el, 'uk-active', 'uk-transition-active');
                }

            }

        };

        function createEl(tag, attrs) {
            var el = fragment(("<" + tag + ">"));
            attr(el, attrs);
            return el;
        }

        var lightbox = {

            install: install$2,

            props: {toggle: String},

            data: {toggle: 'a'},

            computed: {

                toggles: {

                    get: function(ref, $el) {
                        var toggle = ref.toggle;

                        return $$(toggle, $el);
                    },

                    watch: function() {
                        this.hide();
                    }

                }

            },

            disconnected: function() {
                this.hide();
            },

            events: [

                {

                    name: 'click',

                    delegate: function() {
                        return ((this.toggle) + ":not(.uk-disabled)");
                    },

                    handler: function(e) {
                        e.preventDefault();
                        this.show(e.current);
                    }

                }

            ],

            methods: {

                show: function(index) {
                    var this$1 = this;


                    var items = uniqueBy(this.toggles.map(toItem), 'source');

                    if (isElement(index)) {
                        var ref = toItem(index);
                        var source = ref.source;
                        index = findIndex(items, function (ref) {
                            var src = ref.source;

                            return source === src;
                        });
                    }

                    this.panel = this.panel || this.$create('lightboxPanel', assign({}, this.$props, {items: items}));

                    on(this.panel.$el, 'hidden', function () { return this$1.panel = false; });

                    return this.panel.show(index);

                },

                hide: function() {

                    return this.panel && this.panel.hide();

                }

            }

        };

        function install$2(UIkit, Lightbox) {

            if (!UIkit.lightboxPanel) {
                UIkit.component('lightboxPanel', LightboxPanel);
            }

            assign(
                Lightbox.props,
                UIkit.component('lightboxPanel').options.props
            );

        }

        function toItem(el) {

            var item = {};

            ['href', 'caption', 'type', 'poster', 'alt', 'attrs'].forEach(function (attr) {
                item[attr === 'href' ? 'source' : attr] = data(el, attr);
            });

            item.attrs = parseOptions(item.attrs);

            return item;
        }

        var obj;

        var notification = {

            functional: true,

            args: ['message', 'status'],

            data: {
                message: '',
                status: '',
                timeout: 5000,
                group: null,
                pos: 'top-center',
                clsContainer: 'uk-notification',
                clsClose: 'uk-notification-close',
                clsMsg: 'uk-notification-message'
            },

            install: install$3,

            computed: {

                marginProp: function(ref) {
                    var pos = ref.pos;

                    return ("margin" + (startsWith(pos, 'top') ? 'Top' : 'Bottom'));
                },

                startProps: function() {
                    var obj;

                    return ( obj = {opacity: 0}, obj[this.marginProp] = -this.$el.offsetHeight, obj );
                }

            },

            created: function() {

                var container = $(("." + (this.clsContainer) + "-" + (this.pos)), this.$container)
                    || append(this.$container, ("<div class=\"" + (this.clsContainer) + " " + (this.clsContainer) + "-" + (this.pos) + "\" style=\"display: block\"></div>"));

                this.$mount(append(container,
                    ("<div class=\"" + (this.clsMsg) + (this.status ? (" " + (this.clsMsg) + "-" + (this.status)) : '') + "\"> <a href class=\"" + (this.clsClose) + "\" data-uk-close></a> <div>" + (this.message) + "</div> </div>")
                ));

            },

            connected: function() {
                var this$1 = this;
                var obj;


                var margin = toFloat(css(this.$el, this.marginProp));
                Transition.start(
                    css(this.$el, this.startProps),
                    ( obj = {opacity: 1}, obj[this.marginProp] = margin, obj )
                ).then(function () {
                    if (this$1.timeout) {
                        this$1.timer = setTimeout(this$1.close, this$1.timeout);
                    }
                });

            },

            events: ( obj = {

                click: function(e) {
                    if (closest(e.target, 'a[href="#"],a[href=""]')) {
                        e.preventDefault();
                    }
                    this.close();
                }

            }, obj[pointerEnter] = function () {
                    if (this.timer) {
                        clearTimeout(this.timer);
                    }
                }, obj[pointerLeave] = function () {
                    if (this.timeout) {
                        this.timer = setTimeout(this.close, this.timeout);
                    }
                }, obj ),

            methods: {

                close: function(immediate) {
                    var this$1 = this;


                    var removeFn = function () {

                        var container = this$1.$el.parentNode;

                        trigger(this$1.$el, 'close', [this$1]);
                        remove(this$1.$el);

                        if (container && !container.hasChildNodes()) {
                            remove(container);
                        }

                    };

                    if (this.timer) {
                        clearTimeout(this.timer);
                    }

                    if (immediate) {
                        removeFn();
                    } else {
                        Transition.start(this.$el, this.startProps).then(removeFn);
                    }
                }

            }

        };

        function install$3(UIkit) {
            UIkit.notification.closeAll = function (group, immediate) {
                apply(document.body, function (el) {
                    var notification = UIkit.getComponent(el, 'notification');
                    if (notification && (!group || group === notification.group)) {
                        notification.close(immediate);
                    }
                });
            };
        }

        var props = ['x', 'y', 'bgx', 'bgy', 'rotate', 'scale', 'color', 'backgroundColor', 'borderColor', 'opacity', 'blur', 'hue', 'grayscale', 'invert', 'saturate', 'sepia', 'fopacity', 'stroke'];

        var Parallax = {

            mixins: [Media],

            props: props.reduce(function (props, prop) {
                props[prop] = 'list';
                return props;
            }, {}),

            data: props.reduce(function (data, prop) {
                data[prop] = undefined;
                return data;
            }, {}),

            computed: {

                props: function(properties, $el) {
                    var this$1 = this;


                    return props.reduce(function (props, prop) {

                        if (isUndefined(properties[prop])) {
                            return props;
                        }

                        var isColor = prop.match(/color/i);
                        var isCssProp = isColor || prop === 'opacity';

                        var pos, bgPos, diff;
                        var steps = properties[prop].slice(0);

                        if (isCssProp) {
                            css($el, prop, '');
                        }

                        if (steps.length < 2) {
                            steps.unshift((prop === 'scale'
                                ? 1
                                : isCssProp
                                    ? css($el, prop)
                                    : 0) || 0);
                        }

                        var unit = getUnit(steps);

                        if (isColor) {

                            var ref = $el.style;
                            var color = ref.color;
                            steps = steps.map(function (step) { return parseColor($el, step); });
                            $el.style.color = color;

                        } else if (startsWith(prop, 'bg')) {

                            var attr = prop === 'bgy' ? 'height' : 'width';
                            steps = steps.map(function (step) { return toPx(step, attr, this$1.$el); });

                            css($el, ("background-position-" + (prop[2])), '');
                            bgPos = css($el, 'backgroundPosition').split(' ')[prop[2] === 'x' ? 0 : 1]; // IE 11 can't read background-position-[x|y]

                            if (this$1.covers) {

                                var min = Math.min.apply(Math, steps);
                                var max = Math.max.apply(Math, steps);
                                var down = steps.indexOf(min) < steps.indexOf(max);

                                diff = max - min;

                                steps = steps.map(function (step) { return step - (down ? min : max); });
                                pos = (down ? -diff : 0) + "px";

                            } else {

                                pos = bgPos;

                            }

                        } else {

                            steps = steps.map(toFloat);

                        }

                        if (prop === 'stroke') {

                            if (!steps.some(function (step) { return step; })) {
                                return props;
                            }

                            var length = getMaxPathLength(this$1.$el);
                            css($el, 'strokeDasharray', length);

                            if (unit === '%') {
                                steps = steps.map(function (step) { return step * length / 100; });
                            }

                            steps = steps.reverse();

                            prop = 'strokeDashoffset';
                        }

                        props[prop] = {steps: steps, unit: unit, pos: pos, bgPos: bgPos, diff: diff};

                        return props;

                    }, {});

                },

                bgProps: function() {
                    var this$1 = this;

                    return ['bgx', 'bgy'].filter(function (bg) { return bg in this$1.props; });
                },

                covers: function(_, $el) {
                    return covers($el);
                }

            },

            disconnected: function() {
                delete this._image;
            },

            update: {

                read: function(data) {
                    var this$1 = this;


                    data.active = this.matchMedia;

                    if (!data.active) {
                        return;
                    }

                    if (!data.image && this.covers && this.bgProps.length) {
                        var src = css(this.$el, 'backgroundImage').replace(/^none|url\(["']?(.+?)["']?\)$/, '$1');

                        if (src) {
                            var img = new Image();
                            img.src = src;
                            data.image = img;

                            if (!img.naturalWidth) {
                                img.onload = function () { return this$1.$update(); };
                            }
                        }

                    }

                    var image = data.image;

                    if (!image || !image.naturalWidth) {
                        return;
                    }

                    var dimEl = {
                        width: this.$el.offsetWidth,
                        height: this.$el.offsetHeight
                    };
                    var dimImage = {
                        width: image.naturalWidth,
                        height: image.naturalHeight
                    };

                    var dim = Dimensions.cover(dimImage, dimEl);

                    this.bgProps.forEach(function (prop) {

                        var ref = this$1.props[prop];
                        var diff = ref.diff;
                        var bgPos = ref.bgPos;
                        var steps = ref.steps;
                        var attr = prop === 'bgy' ? 'height' : 'width';
                        var span = dim[attr] - dimEl[attr];

                        if (span < diff) {
                            dimEl[attr] = dim[attr] + diff - span;
                        } else if (span > diff) {

                            var posPercentage = dimEl[attr] / toPx(bgPos, attr, this$1.$el);

                            if (posPercentage) {
                                this$1.props[prop].steps = steps.map(function (step) { return step - (span - diff) / posPercentage; });
                            }
                        }

                        dim = Dimensions.cover(dimImage, dimEl);
                    });

                    data.dim = dim;
                },

                write: function(ref) {
                    var dim = ref.dim;
                    var active = ref.active;


                    if (!active) {
                        css(this.$el, {backgroundSize: '', backgroundRepeat: ''});
                        return;
                    }

                    dim && css(this.$el, {
                        backgroundSize: ((dim.width) + "px " + (dim.height) + "px"),
                        backgroundRepeat: 'no-repeat'
                    });

                },

                events: ['resize']

            },

            methods: {

                reset: function() {
                    var this$1 = this;

                    each(this.getCss(0), function (_, prop) { return css(this$1.$el, prop, ''); });
                },

                getCss: function(percent) {

                    var ref = this;
                    var props = ref.props;
                    return Object.keys(props).reduce(function (css, prop) {

                        var ref = props[prop];
                        var steps = ref.steps;
                        var unit = ref.unit;
                        var pos = ref.pos;
                        var value = getValue(steps, percent);

                        switch (prop) {

                            // transforms
                            case 'x':
                            case 'y': {
                                unit = unit || 'px';
                                css.transform += " translate" + (ucfirst(prop)) + "(" + (toFloat(value).toFixed(unit === 'px' ? 0 : 2)) + unit + ")";
                                break;
                            }
                            case 'rotate':
                                unit = unit || 'deg';
                                css.transform += " rotate(" + (value + unit) + ")";
                                break;
                            case 'scale':
                                css.transform += " scale(" + value + ")";
                                break;

                            // bg image
                            case 'bgy':
                            case 'bgx':
                                css[("background-position-" + (prop[2]))] = "calc(" + pos + " + " + value + "px)";
                                break;

                            // color
                            case 'color':
                            case 'backgroundColor':
                            case 'borderColor': {

                                var ref$1 = getStep(steps, percent);
                                var start = ref$1[0];
                                var end = ref$1[1];
                                var p = ref$1[2];

                                css[prop] = "rgba(" + (start.map(function (value, i) {
                                        value = value + p * (end[i] - value);
                                        return i === 3 ? toFloat(value) : parseInt(value, 10);
                                    }).join(',')) + ")";
                                break;
                            }
                            // CSS Filter
                            case 'blur':
                                unit = unit || 'px';
                                css.filter += " blur(" + (value + unit) + ")";
                                break;
                            case 'hue':
                                unit = unit || 'deg';
                                css.filter += " hue-rotate(" + (value + unit) + ")";
                                break;
                            case 'fopacity':
                                unit = unit || '%';
                                css.filter += " opacity(" + (value + unit) + ")";
                                break;
                            case 'grayscale':
                            case 'invert':
                            case 'saturate':
                            case 'sepia':
                                unit = unit || '%';
                                css.filter += " " + prop + "(" + (value + unit) + ")";
                                break;
                            default:
                                css[prop] = value;
                        }

                        return css;

                    }, {transform: '', filter: ''});

                }

            }

        };

        function parseColor(el, color) {
            return css(css(el, 'color', color), 'color')
                .split(/[(),]/g)
                .slice(1, -1)
                .concat(1)
                .slice(0, 4)
                .map(toFloat);
        }

        function getStep(steps, percent) {
            var count = steps.length - 1;
            var index = Math.min(Math.floor(count * percent), count - 1);
            var step = steps.slice(index, index + 2);

            step.push(percent === 1 ? 1 : percent % (1 / count) * count);

            return step;
        }

        function getValue(steps, percent, digits) {
            if ( digits === void 0 ) digits = 2;

            var ref = getStep(steps, percent);
            var start = ref[0];
            var end = ref[1];
            var p = ref[2];
            return (isNumber(start)
                ? start + Math.abs(start - end) * p * (start < end ? 1 : -1)
                : +end
            ).toFixed(digits);
        }

        function getUnit(steps) {
            return steps.reduce(function (unit, step) { return isString(step) && step.replace(/-|\d/g, '').trim() || unit; }, '');
        }

        function covers(el) {
            var ref = el.style;
            var backgroundSize = ref.backgroundSize;
            var covers = css(css(el, 'backgroundSize', ''), 'backgroundSize') === 'cover';
            el.style.backgroundSize = backgroundSize;
            return covers;
        }

        var parallax = {

            mixins: [Parallax],

            props: {
                target: String,
                viewport: Number,
                easing: Number
            },

            data: {
                target: false,
                viewport: 1,
                easing: 1
            },

            computed: {

                target: function(ref, $el) {
                    var target = ref.target;

                    return getOffsetElement(target && query(target, $el) || $el);
                }

            },

            update: {

                read: function(ref, type) {
                    var percent = ref.percent;
                    var active = ref.active;


                    if (type !== 'scroll') {
                        percent = false;
                    }

                    if (!active) {
                        return;
                    }

                    var prev = percent;
                    percent = ease(scrolledOver(this.target) / (this.viewport || 1), this.easing);

                    return {
                        percent: percent,
                        style: prev !== percent ? this.getCss(percent) : false
                    };
                },

                write: function(ref) {
                    var style = ref.style;
                    var active = ref.active;


                    if (!active) {
                        this.reset();
                        return;
                    }

                    style && css(this.$el, style);

                },

                events: ['scroll', 'resize']
            }

        };

        function ease(percent, easing) {
            return clamp(percent * (1 - (easing - easing * percent)));
        }

        // SVG elements do not inherit from HTMLElement
        function getOffsetElement(el) {
            return el
                ? 'offsetTop' in el
                    ? el
                    : getOffsetElement(el.parentNode)
                : document.body;
        }

        var SliderReactive = {

            update: {

                write: function() {

                    if (this.stack.length || this.dragging) {
                        return;
                    }

                    var index = this.getValidIndex(this.index);

                    if (!~this.prevIndex || this.index !== index) {
                        this.show(index);
                    }

                },

                events: ['resize']

            }

        };

        function Transitioner$1 (prev, next, dir, ref) {
            var center = ref.center;
            var easing = ref.easing;
            var list = ref.list;


            var deferred = new Deferred();

            var from = prev
                ? getLeft(prev, list, center)
                : getLeft(next, list, center) + offset(next).width * dir;
            var to = next
                ? getLeft(next, list, center)
                : from + offset(prev).width * dir * (isRtl ? -1 : 1);

            return {

                dir: dir,

                show: function(duration, percent, linear) {
                    if ( percent === void 0 ) percent = 0;


                    var timing = linear ? 'linear' : easing;
                    duration -= Math.round(duration * clamp(percent, -1, 1));

                    this.translate(percent);

                    prev && this.updateTranslates();
                    percent = prev ? percent : clamp(percent, 0, 1);
                    triggerUpdate$1(this.getItemIn(), 'itemin', {percent: percent, duration: duration, timing: timing, dir: dir});
                    prev && triggerUpdate$1(this.getItemIn(true), 'itemout', {percent: 1 - percent, duration: duration, timing: timing, dir: dir});

                    Transition
                        .start(list, {transform: translate(-to * (isRtl ? -1 : 1), 'px')}, duration, timing)
                        .then(deferred.resolve, noop);

                    return deferred.promise;

                },

                stop: function() {
                    return Transition.stop(list);
                },

                cancel: function() {
                    Transition.cancel(list);
                },

                reset: function() {
                    css(list, 'transform', '');
                },

                forward: function(duration, percent) {
                    if ( percent === void 0 ) percent = this.percent();

                    Transition.cancel(list);
                    return this.show(duration, percent, true);
                },

                translate: function(percent) {

                    var distance = this.getDistance() * dir * (isRtl ? -1 : 1);

                    css(list, 'transform', translate(clamp(
                        -to + (distance - distance * percent),
                        -getWidth(list),
                        offset(list).width
                    ) * (isRtl ? -1 : 1), 'px'));

                    this.updateTranslates();

                    if (prev) {
                        percent = clamp(percent, -1, 1);
                        triggerUpdate$1(this.getItemIn(), 'itemtranslatein', {percent: percent, dir: dir});
                        triggerUpdate$1(this.getItemIn(true), 'itemtranslateout', {percent: 1 - percent, dir: dir});
                    }

                },

                percent: function() {
                    return Math.abs((css(list, 'transform').split(',')[4] * (isRtl ? -1 : 1) + from) / (to - from));
                },

                getDistance: function() {
                    return Math.abs(to - from);
                },

                getItemIn: function(out) {
                    if ( out === void 0 ) out = false;


                    var actives = this.getActives();
                    var all = sortBy(slides(list), 'offsetLeft');
                    var i = index(all, actives[dir * (out ? -1 : 1) > 0 ? actives.length - 1 : 0]);

                    return ~i && all[i + (prev && !out ? dir : 0)];

                },

                getActives: function() {

                    var left = getLeft(prev || next, list, center);

                    return sortBy(slides(list).filter(function (slide) {
                        var slideLeft = getElLeft(slide, list);
                        return slideLeft >= left && slideLeft + offset(slide).width <= offset(list).width + left;
                    }), 'offsetLeft');

                },

                updateTranslates: function() {

                    var actives = this.getActives();

                    slides(list).forEach(function (slide) {
                        var isActive = includes(actives, slide);

                        triggerUpdate$1(slide, ("itemtranslate" + (isActive ? 'in' : 'out')), {
                            percent: isActive ? 1 : 0,
                            dir: slide.offsetLeft <= next.offsetLeft ? 1 : -1
                        });
                    });
                }

            };

        }

        function getLeft(el, list, center) {

            var left = getElLeft(el, list);

            return center
                ? left - centerEl(el, list)
                : Math.min(left, getMax(list));

        }

        function getMax(list) {
            return Math.max(0, getWidth(list) - offset(list).width);
        }

        function getWidth(list) {
            return slides(list).reduce(function (right, el) { return offset(el).width + right; }, 0);
        }

        function getMaxWidth(list) {
            return slides(list).reduce(function (right, el) { return Math.max(right, offset(el).width); }, 0);
        }

        function centerEl(el, list) {
            return offset(list).width / 2 - offset(el).width / 2;
        }

        function getElLeft(el, list) {
            return (position(el).left + (isRtl ? offset(el).width - offset(list).width : 0)) * (isRtl ? -1 : 1);
        }

        function triggerUpdate$1(el, type, data) {
            trigger(el, createEvent(type, false, false, data));
        }

        function slides(list) {
            return children(list);
        }

        var slider = {

            mixins: [Class, Slider, SliderReactive],

            props: {
                center: Boolean,
                sets: Boolean
            },

            data: {
                center: false,
                sets: false,
                attrItem: 'uk-slider-item',
                selList: '.uk-slider-items',
                selNav: '.uk-slider-nav',
                clsContainer: 'uk-slider-container',
                Transitioner: Transitioner$1
            },

            computed: {

                avgWidth: function() {
                    return getWidth(this.list) / this.length;
                },

                finite: function(ref) {
                    var finite = ref.finite;

                    return finite || Math.ceil(getWidth(this.list)) < offset(this.list).width + getMaxWidth(this.list) + this.center;
                },

                maxIndex: function() {

                    if (!this.finite || this.center && !this.sets) {
                        return this.length - 1;
                    }

                    if (this.center) {
                        return last(this.sets);
                    }

                    css(this.slides, 'order', '');

                    var max = getMax(this.list);
                    var i = this.length;

                    while (i--) {
                        if (getElLeft(this.list.children[i], this.list) < max) {
                            return Math.min(i + 1, this.length - 1);
                        }
                    }

                    return 0;
                },

                sets: function(ref) {
                    var this$1 = this;
                    var sets = ref.sets;


                    var width = offset(this.list).width / (this.center ? 2 : 1);

                    var left = 0;
                    var leftCenter = width;
                    var slideLeft = 0;

                    sets = sets && this.slides.reduce(function (sets, slide, i) {

                        var ref = offset(slide);
                        var slideWidth = ref.width;
                        var slideRight = slideLeft + slideWidth;

                        if (slideRight > left) {

                            if (!this$1.center && i > this$1.maxIndex) {
                                i = this$1.maxIndex;
                            }

                            if (!includes(sets, i)) {

                                var cmp = this$1.slides[i + 1];
                                if (this$1.center && cmp && slideWidth < leftCenter - offset(cmp).width / 2) {
                                    leftCenter -= slideWidth;
                                } else {
                                    leftCenter = width;
                                    sets.push(i);
                                    left = slideLeft + width + (this$1.center ? slideWidth / 2 : 0);
                                }

                            }
                        }

                        slideLeft += slideWidth;

                        return sets;

                    }, []);

                    return !isEmpty(sets) && sets;

                },

                transitionOptions: function() {
                    return {
                        center: this.center,
                        list: this.list
                    };
                }

            },

            connected: function() {
                toggleClass(this.$el, this.clsContainer, !$(("." + (this.clsContainer)), this.$el));
            },

            update: {

                write: function() {
                    var this$1 = this;


                    $$(("[" + (this.attrItem) + "],[data-" + (this.attrItem) + "]"), this.$el).forEach(function (el) {
                        var index = data(el, this$1.attrItem);
                        this$1.maxIndex && toggleClass(el, 'uk-hidden', isNumeric(index) && (this$1.sets && !includes(this$1.sets, toFloat(index)) || index > this$1.maxIndex));
                    });

                    if (this.length && !this.dragging && !this.stack.length) {
                        this._translate(1);
                    }

                },

                events: ['resize']

            },

            events: {

                beforeitemshow: function(e) {

                    if (!this.dragging && this.sets && this.stack.length < 2 && !includes(this.sets, this.index)) {
                        this.index = this.getValidIndex();
                    }

                    var diff = Math.abs(
                        this.index
                        - this.prevIndex
                        + (this.dir > 0 && this.index < this.prevIndex || this.dir < 0 && this.index > this.prevIndex ? (this.maxIndex + 1) * this.dir : 0)
                    );

                    if (!this.dragging && diff > 1) {

                        for (var i = 0; i < diff; i++) {
                            this.stack.splice(1, 0, this.dir > 0 ? 'next' : 'previous');
                        }

                        e.preventDefault();
                        return;
                    }

                    this.duration = speedUp(this.avgWidth / this.velocity)
                        * (offset(
                            this.dir < 0 || !this.slides[this.prevIndex]
                                ? this.slides[this.index]
                                : this.slides[this.prevIndex]
                        ).width / this.avgWidth);

                    this.reorder();

                },

                itemshow: function() {
                    !isUndefined(this.prevIndex) && addClass(this._getTransitioner().getItemIn(), this.clsActive);
                },

                itemshown: function() {
                    var this$1 = this;

                    var actives = this._getTransitioner(this.index).getActives();
                    this.slides.forEach(function (slide) { return toggleClass(slide, this$1.clsActive, includes(actives, slide)); });
                    (!this.sets || includes(this.sets, toFloat(this.index))) && this.slides.forEach(function (slide) { return toggleClass(slide, this$1.clsActivated, includes(actives, slide)); });
                }

            },

            methods: {

                reorder: function() {
                    var this$1 = this;


                    css(this.slides, 'order', '');

                    if (this.finite) {
                        return;
                    }

                    var index = this.dir > 0 && this.slides[this.prevIndex] ? this.prevIndex : this.index;

                    this.slides.forEach(function (slide, i) { return css(slide, 'order', this$1.dir > 0 && i < index
                            ? 1
                            : this$1.dir < 0 && i >= this$1.index
                                ? -1
                                : ''
                        ); }
                    );

                    if (!this.center) {
                        return;
                    }

                    var next = this.slides[index];
                    var width = offset(this.list).width / 2 - offset(next).width / 2;
                    var j = 0;

                    while (width > 0) {
                        var slideIndex = this.getIndex(--j + index, index);
                        var slide = this.slides[slideIndex];

                        css(slide, 'order', slideIndex > index ? -2 : -1);
                        width -= offset(slide).width;
                    }

                },

                getValidIndex: function(index, prevIndex) {
                    if ( index === void 0 ) index = this.index;
                    if ( prevIndex === void 0 ) prevIndex = this.prevIndex;


                    index = this.getIndex(index, prevIndex);

                    if (!this.sets) {
                        return index;
                    }

                    var prev;

                    do {

                        if (includes(this.sets, index)) {
                            return index;
                        }

                        prev = index;
                        index = this.getIndex(index + this.dir, prevIndex);

                    } while (index !== prev);

                    return index;
                }

            }

        };

        var sliderParallax = {

            mixins: [Parallax],

            data: {
                selItem: '!li'
            },

            computed: {

                item: function(ref, $el) {
                    var selItem = ref.selItem;

                    return query(selItem, $el);
                }

            },

            events: [

                {

                    name: 'itemshown',

                    self: true,

                    el: function() {
                        return this.item;
                    },

                    handler: function() {
                        css(this.$el, this.getCss(.5));
                    }

                },

                {
                    name: 'itemin itemout',

                    self: true,

                    el: function() {
                        return this.item;
                    },

                    handler: function(ref) {
                        var type = ref.type;
                        var ref_detail = ref.detail;
                        var percent = ref_detail.percent;
                        var duration = ref_detail.duration;
                        var timing = ref_detail.timing;
                        var dir = ref_detail.dir;


                        Transition.cancel(this.$el);
                        css(this.$el, this.getCss(getCurrent(type, dir, percent)));

                        Transition.start(this.$el, this.getCss(isIn(type)
                            ? .5
                            : dir > 0
                                ? 1
                                : 0
                        ), duration, timing).catch(noop);

                    }
                },

                {
                    name: 'transitioncanceled transitionend',

                    self: true,

                    el: function() {
                        return this.item;
                    },

                    handler: function() {
                        Transition.cancel(this.$el);
                    }

                },

                {
                    name: 'itemtranslatein itemtranslateout',

                    self: true,

                    el: function() {
                        return this.item;
                    },

                    handler: function(ref) {
                        var type = ref.type;
                        var ref_detail = ref.detail;
                        var percent = ref_detail.percent;
                        var dir = ref_detail.dir;

                        Transition.cancel(this.$el);
                        css(this.$el, this.getCss(getCurrent(type, dir, percent)));
                    }
                }

            ]

        };

        function isIn(type) {
            return endsWith(type, 'in');
        }

        function getCurrent(type, dir, percent) {

            percent /= 2;

            return !isIn(type)
                ? dir < 0
                    ? percent
                    : 1 - percent
                : dir < 0
                    ? 1 - percent
                    : percent;
        }

        var Animations$2 = assign({}, Animations, {

            fade: {

                show: function() {
                    return [
                        {opacity: 0, zIndex: 0},
                        {zIndex: -1}
                    ];
                },

                percent: function(current) {
                    return 1 - css(current, 'opacity');
                },

                translate: function(percent) {
                    return [
                        {opacity: 1 - percent, zIndex: 0},
                        {zIndex: -1}
                    ];
                }

            },

            scale: {

                show: function() {
                    return [
                        {opacity: 0, transform: scale3d(1 + .5), zIndex: 0},
                        {zIndex: -1}
                    ];
                },

                percent: function(current) {
                    return 1 - css(current, 'opacity');
                },

                translate: function(percent) {
                    return [
                        {opacity: 1 - percent, transform: scale3d(1 + .5 * percent), zIndex: 0},
                        {zIndex: -1}
                    ];
                }

            },

            pull: {

                show: function(dir) {
                    return dir < 0
                        ? [
                            {transform: translate(30), zIndex: -1},
                            {transform: translate(), zIndex: 0}
                        ]
                        : [
                            {transform: translate(-100), zIndex: 0},
                            {transform: translate(), zIndex: -1}
                        ];
                },

                percent: function(current, next, dir) {
                    return dir < 0
                        ? 1 - translated(next)
                        : translated(current);
                },

                translate: function(percent, dir) {
                    return dir < 0
                        ? [
                            {transform: translate(30 * percent), zIndex: -1},
                            {transform: translate(-100 * (1 - percent)), zIndex: 0}
                        ]
                        : [
                            {transform: translate(-percent * 100), zIndex: 0},
                            {transform: translate(30 * (1 - percent)), zIndex: -1}
                        ];
                }

            },

            push: {

                show: function(dir) {
                    return dir < 0
                        ? [
                            {transform: translate(100), zIndex: 0},
                            {transform: translate(), zIndex: -1}
                        ]
                        : [
                            {transform: translate(-30), zIndex: -1},
                            {transform: translate(), zIndex: 0}
                        ];
                },

                percent: function(current, next, dir) {
                    return dir > 0
                        ? 1 - translated(next)
                        : translated(current);
                },

                translate: function(percent, dir) {
                    return dir < 0
                        ? [
                            {transform: translate(percent * 100), zIndex: 0},
                            {transform: translate(-30 * (1 - percent)), zIndex: -1}
                        ]
                        : [
                            {transform: translate(-30 * percent), zIndex: -1},
                            {transform: translate(100 * (1 - percent)), zIndex: 0}
                        ];
                }

            }

        });

        var slideshow = {

            mixins: [Class, Slideshow, SliderReactive],

            props: {
                ratio: String,
                minHeight: Number,
                maxHeight: Number
            },

            data: {
                ratio: '16:9',
                minHeight: false,
                maxHeight: false,
                selList: '.uk-slideshow-items',
                attrItem: 'uk-slideshow-item',
                selNav: '.uk-slideshow-nav',
                Animations: Animations$2
            },

            update: {

                read: function() {

                    var ref = this.ratio.split(':').map(Number);
                    var width = ref[0];
                    var height = ref[1];

                    height = height * this.list.offsetWidth / width || 0;

                    if (this.minHeight) {
                        height = Math.max(this.minHeight, height);
                    }

                    if (this.maxHeight) {
                        height = Math.min(this.maxHeight, height);
                    }

                    return {height: height - boxModelAdjust(this.list, 'height', 'content-box')};
                },

                write: function(ref) {
                    var height = ref.height;

                    height > 0 && css(this.list, 'minHeight', height);
                },

                events: ['resize']

            }

        };

        var sortable = {

            mixins: [Class, Animate],

            props: {
                group: String,
                threshold: Number,
                clsItem: String,
                clsPlaceholder: String,
                clsDrag: String,
                clsDragState: String,
                clsBase: String,
                clsNoDrag: String,
                clsEmpty: String,
                clsCustom: String,
                handle: String
            },

            data: {
                group: false,
                threshold: 5,
                clsItem: 'uk-sortable-item',
                clsPlaceholder: 'uk-sortable-placeholder',
                clsDrag: 'uk-sortable-drag',
                clsDragState: 'uk-drag',
                clsBase: 'uk-sortable',
                clsNoDrag: 'uk-sortable-nodrag',
                clsEmpty: 'uk-sortable-empty',
                clsCustom: '',
                handle: false,
                pos: {}
            },

            created: function() {
                var this$1 = this;

                ['init', 'start', 'move', 'end'].forEach(function (key) {
                    var fn = this$1[key];
                    this$1[key] = function (e) {
                        assign(this$1.pos, getEventPos(e));
                        fn(e);
                    };
                });
            },

            events: {

                name: pointerDown,
                passive: false,
                handler: 'init'

            },

            computed: {

                target: function() {
                    return (this.$el.tBodies || [this.$el])[0];
                },

                items: function() {
                    return children(this.target);
                },

                isEmpty: {

                    get: function() {
                        return isEmpty(this.items);
                    },

                    watch: function(empty) {
                        toggleClass(this.target, this.clsEmpty, empty);
                    },

                    immediate: true

                },

                handles: {

                    get: function(ref, el) {
                        var handle = ref.handle;

                        return handle ? $$(handle, el) : this.items;
                    },

                    watch: function(handles, prev) {
                        css(prev, {touchAction: '', userSelect: ''});
                        css(handles, {touchAction: hasTouch ? 'none' : '', userSelect: 'none'}); // touchAction set to 'none' causes a performance drop in Chrome 80
                    },

                    immediate: true

                }

            },

            update: {

                write: function() {

                    if (!this.drag || !parent(this.placeholder)) {
                        return;
                    }

                    // clamp to viewport
                    var ref = this.pos;
                    var x = ref.x;
                    var y = ref.y;
                    var ref$1 = this.origin;
                    var offsetTop = ref$1.offsetTop;
                    var offsetLeft = ref$1.offsetLeft;
                    var ref$2 = this.drag;
                    var offsetHeight = ref$2.offsetHeight;
                    var offsetWidth = ref$2.offsetWidth;
                    var ref$3 = offset(window);
                    var right = ref$3.right;
                    var bottom = ref$3.bottom;
                    var target = document.elementFromPoint(x, y);

                    css(this.drag, {
                        top: clamp(y - offsetTop, 0, bottom - offsetHeight),
                        left: clamp(x - offsetLeft, 0, right - offsetWidth)
                    });

                    var sortable = this.getSortable(target);
                    var previous = this.getSortable(this.placeholder);
                    var move = sortable !== previous;

                    if (!sortable || within(target, this.placeholder) || move && (!sortable.group || sortable.group !== previous.group)) {
                        return;
                    }

                    target = sortable.target === target.parentNode && target || sortable.items.filter(function (element) { return within(target, element); })[0];

                    if (move) {
                        previous.remove(this.placeholder);
                    } else if (!target) {
                        return;
                    }

                    sortable.insert(this.placeholder, target);

                    if (!includes(this.touched, sortable)) {
                        this.touched.push(sortable);
                    }

                },

                events: ['move']

            },

            methods: {

                init: function(e) {

                    var target = e.target;
                    var button = e.button;
                    var defaultPrevented = e.defaultPrevented;
                    var ref = this.items.filter(function (el) { return within(target, el); });
                    var placeholder = ref[0];

                    if (!placeholder
                        || defaultPrevented
                        || button > 0
                        || isInput(target)
                        || within(target, ("." + (this.clsNoDrag)))
                        || this.handle && !within(target, this.handle)
                    ) {
                        return;
                    }

                    e.preventDefault();

                    this.touched = [this];
                    this.placeholder = placeholder;
                    this.origin = assign({target: target, index: index(placeholder)}, this.pos);

                    on(document, pointerMove, this.move);
                    on(document, pointerUp, this.end);

                    if (!this.threshold) {
                        this.start(e);
                    }

                },

                start: function(e) {

                    this.drag = appendDrag(this.$container, this.placeholder);
                    var ref = this.placeholder.getBoundingClientRect();
                    var left = ref.left;
                    var top = ref.top;
                    assign(this.origin, {offsetLeft: this.pos.x - left, offsetTop: this.pos.y - top});

                    addClass(this.drag, this.clsDrag, this.clsCustom);
                    addClass(this.placeholder, this.clsPlaceholder);
                    addClass(this.items, this.clsItem);
                    addClass(document.documentElement, this.clsDragState);

                    trigger(this.$el, 'start', [this, this.placeholder]);

                    trackScroll(this.pos);

                    this.move(e);
                },

                move: function(e) {

                    if (this.drag) {
                        this.$emit('move');
                    } else if (Math.abs(this.pos.x - this.origin.x) > this.threshold || Math.abs(this.pos.y - this.origin.y) > this.threshold) {
                        this.start(e);
                    }

                },

                end: function(e) {

                    off(document, pointerMove, this.move);
                    off(document, pointerUp, this.end);
                    off(window, 'scroll', this.scroll);

                    if (!this.drag) {
                        if (e.type === 'touchend') {
                            e.target.click();
                        }

                        return;
                    }

                    untrackScroll();

                    var sortable = this.getSortable(this.placeholder);

                    if (this === sortable) {
                        if (this.origin.index !== index(this.placeholder)) {
                            trigger(this.$el, 'moved', [this, this.placeholder]);
                        }
                    } else {
                        trigger(sortable.$el, 'added', [sortable, this.placeholder]);
                        trigger(this.$el, 'removed', [this, this.placeholder]);
                    }

                    trigger(this.$el, 'stop', [this, this.placeholder]);

                    remove(this.drag);
                    this.drag = null;

                    var classes = this.touched.map(function (sortable) { return ((sortable.clsPlaceholder) + " " + (sortable.clsItem)); }).join(' ');
                    this.touched.forEach(function (sortable) { return removeClass(sortable.items, classes); });

                    removeClass(document.documentElement, this.clsDragState);

                },

                insert: function(element, target) {
                    var this$1 = this;


                    addClass(this.items, this.clsItem);

                    var insert = function () {

                        if (target) {

                            if (!within(element, this$1.target) || isPredecessor(element, target)) {
                                before(target, element);
                            } else {
                                after(target, element);
                            }

                        } else {
                            append(this$1.target, element);
                        }

                    };

                    if (this.animation) {
                        this.animate(insert);
                    } else {
                        insert();
                    }

                },

                remove: function(element) {

                    if (!within(element, this.target)) {
                        return;
                    }

                    if (this.animation) {
                        this.animate(function () { return remove(element); });
                    } else {
                        remove(element);
                    }

                },

                getSortable: function(element) {
                    return element && (this.$getComponent(element, 'sortable') || this.getSortable(element.parentNode));
                }

            }

        };

        function isPredecessor(element, target) {
            return element.parentNode === target.parentNode && index(element) > index(target);
        }

        var trackTimer;
        function trackScroll(pos) {

            var last = Date.now();
            trackTimer = setInterval(function () {

                var x = pos.x;
                var y = pos.y;
                y += window.pageYOffset;

                var dist = (Date.now() - last) * .3;
                last = Date.now();

                scrollParents(document.elementFromPoint(x, pos.y)).some(function (scrollEl) {

                    var scroll = scrollEl.scrollTop;
                    var scrollHeight = scrollEl.scrollHeight;

                    var ref = offset(getViewport(scrollEl));
                    var top = ref.top;
                    var bottom = ref.bottom;
                    var height = ref.height;

                    if (top < y && top + 30 > y) {
                        scroll -= dist;
                    } else if (bottom > y && bottom - 30 < y) {
                        scroll += dist;
                    } else {
                        return;
                    }

                    if (scroll > 0 && scroll < scrollHeight - height) {
                        scrollTop(scrollEl, scroll);
                        return true;
                    }

                });

            }, 15);

        }

        function untrackScroll() {
            clearInterval(trackTimer);
        }

        function appendDrag(container, element) {
            var clone = append(container, element.outerHTML.replace(/(^<)(?:li|tr)|(?:li|tr)(\/>$)/g, '$1div$2'));

            attr(clone, 'style', ((attr(clone, 'style')) + ";margin:0!important"));

            css(clone, assign({
                boxSizing: 'border-box',
                width: element.offsetWidth,
                height: element.offsetHeight,
                overflow: 'hidden'
            }, css(element, ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'])));

            height(clone.firstElementChild, height(element.firstElementChild));

            return clone;
        }

        var obj$1;

        var actives = [];

        var tooltip = {

            mixins: [Container, Togglable, Position],

            args: 'title',

            props: {
                delay: Number,
                title: String
            },

            data: {
                pos: 'top',
                title: '',
                delay: 0,
                animation: ['uk-animation-scale-up'],
                duration: 100,
                cls: 'uk-active',
                clsPos: 'uk-tooltip'
            },

            beforeConnect: function() {
                this._hasTitle = hasAttr(this.$el, 'title');
                attr(this.$el, {title: '', 'aria-expanded': false});
            },

            disconnected: function() {
                this.hide();
                attr(this.$el, {title: this._hasTitle ? this.title : null, 'aria-expanded': null});
            },

            methods: {

                show: function() {
                    var this$1 = this;


                    if (this.isActive() || !this.title) {
                        return;
                    }

                    actives.forEach(function (active) { return active.hide(); });
                    actives.push(this);

                    this._unbind = on(document, pointerUp, function (e) { return !within(e.target, this$1.$el) && this$1.hide(); });

                    clearTimeout(this.showTimer);
                    this.showTimer = setTimeout(this._show, this.delay);
                },

                hide: function() {
                    var this$1 = this;


                    if (!this.isActive() || matches(this.$el, 'input:focus')) {
                        return;
                    }

                    this.toggleElement(this.tooltip, false, false).then(function () {

                        actives.splice(actives.indexOf(this$1), 1);

                        clearTimeout(this$1.showTimer);

                        this$1.tooltip = remove(this$1.tooltip);
                        this$1._unbind();
                    });
                },

                _show: function() {
                    var this$1 = this;


                    this.tooltip = append(this.container,
                        ("<div class=\"" + (this.clsPos) + "\"> <div class=\"" + (this.clsPos) + "-inner\">" + (this.title) + "</div> </div>")
                    );

                    on(this.tooltip, 'toggled', function () {

                        var toggled = this$1.isToggled(this$1.tooltip);

                        attr(this$1.$el, 'aria-expanded', toggled);

                        if (!toggled) {
                            return;
                        }

                        this$1.positionAt(this$1.tooltip, this$1.$el);

                        this$1.origin = this$1.getAxis() === 'y'
                            ? ((flipPosition(this$1.dir)) + "-" + (this$1.align))
                            : ((this$1.align) + "-" + (flipPosition(this$1.dir)));
                    });

                    this.toggleElement(this.tooltip, true);

                },

                isActive: function() {
                    return includes(actives, this);
                }

            },

            events: ( obj$1 = {

                focus: 'show',
                blur: 'hide'

            }, obj$1[(pointerEnter + " " + pointerLeave)] = function (e) {
                    if (isTouch(e)) {
                        return;
                    }
                    e.type === pointerEnter
                        ? this.show()
                        : this.hide();
                }, obj$1[pointerDown] = function (e) {
                    if (!isTouch(e)) {
                        return;
                    }
                    this.isActive()
                        ? this.hide()
                        : this.show();
                }, obj$1 )

        };

        var upload = {

            props: {
                allow: String,
                clsDragover: String,
                concurrent: Number,
                maxSize: Number,
                method: String,
                mime: String,
                msgInvalidMime: String,
                msgInvalidName: String,
                msgInvalidSize: String,
                multiple: Boolean,
                name: String,
                params: Object,
                type: String,
                url: String
            },

            data: {
                allow: false,
                clsDragover: 'uk-dragover',
                concurrent: 1,
                maxSize: 0,
                method: 'POST',
                mime: false,
                msgInvalidMime: 'Invalid File Type: %s',
                msgInvalidName: 'Invalid File Name: %s',
                msgInvalidSize: 'Invalid File Size: %s Kilobytes Max',
                multiple: false,
                name: 'files[]',
                params: {},
                type: '',
                url: '',
                abort: noop,
                beforeAll: noop,
                beforeSend: noop,
                complete: noop,
                completeAll: noop,
                error: noop,
                fail: noop,
                load: noop,
                loadEnd: noop,
                loadStart: noop,
                progress: noop
            },

            events: {

                change: function(e) {

                    if (!matches(e.target, 'input[type="file"]')) {
                        return;
                    }

                    e.preventDefault();

                    if (e.target.files) {
                        this.upload(e.target.files);
                    }

                    e.target.value = '';
                },

                drop: function(e) {
                    stop(e);

                    var transfer = e.dataTransfer;

                    if (!transfer || !transfer.files) {
                        return;
                    }

                    removeClass(this.$el, this.clsDragover);

                    this.upload(transfer.files);
                },

                dragenter: function(e) {
                    stop(e);
                },

                dragover: function(e) {
                    stop(e);
                    addClass(this.$el, this.clsDragover);
                },

                dragleave: function(e) {
                    stop(e);
                    removeClass(this.$el, this.clsDragover);
                }

            },

            methods: {

                upload: function(files) {
                    var this$1 = this;


                    if (!files.length) {
                        return;
                    }

                    trigger(this.$el, 'upload', [files]);

                    for (var i = 0; i < files.length; i++) {

                        if (this.maxSize && this.maxSize * 1000 < files[i].size) {
                            this.fail(this.msgInvalidSize.replace('%s', this.maxSize));
                            return;
                        }

                        if (this.allow && !match$1(this.allow, files[i].name)) {
                            this.fail(this.msgInvalidName.replace('%s', this.allow));
                            return;
                        }

                        if (this.mime && !match$1(this.mime, files[i].type)) {
                            this.fail(this.msgInvalidMime.replace('%s', this.mime));
                            return;
                        }

                    }

                    if (!this.multiple) {
                        files = [files[0]];
                    }

                    this.beforeAll(this, files);

                    var chunks = chunk(files, this.concurrent);
                    var upload = function (files) {

                        var data = new FormData();

                        files.forEach(function (file) { return data.append(this$1.name, file); });

                        for (var key in this$1.params) {
                            data.append(key, this$1.params[key]);
                        }

                        ajax(this$1.url, {
                            data: data,
                            method: this$1.method,
                            responseType: this$1.type,
                            beforeSend: function (env) {

                                var xhr = env.xhr;
                                xhr.upload && on(xhr.upload, 'progress', this$1.progress);
                                ['loadStart', 'load', 'loadEnd', 'abort'].forEach(function (type) { return on(xhr, type.toLowerCase(), this$1[type]); }
                                );

                                this$1.beforeSend(env);

                            }
                        }).then(
                            function (xhr) {

                                this$1.complete(xhr);

                                if (chunks.length) {
                                    upload(chunks.shift());
                                } else {
                                    this$1.completeAll(xhr);
                                }

                            },
                            function (e) { return this$1.error(e); }
                        );

                    };

                    upload(chunks.shift());

                }

            }

        };

        function match$1(pattern, path) {
            return path.match(new RegExp(("^" + (pattern.replace(/\//g, '\\/').replace(/\*\*/g, '(\\/[^\\/]+)*').replace(/\*/g, '[^\\/]+').replace(/((?!\\))\?/g, '$1.')) + "$"), 'i'));
        }

        function chunk(files, size) {
            var chunks = [];
            for (var i = 0; i < files.length; i += size) {
                var chunk = [];
                for (var j = 0; j < size; j++) {
                    chunk.push(files[i + j]);
                }
                chunks.push(chunk);
            }
            return chunks;
        }

        function stop(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        var components = /*#__PURE__*/Object.freeze({
            __proto__: null,
            Countdown: countdown,
            Filter: filter$1,
            Lightbox: lightbox,
            LightboxPanel: LightboxPanel,
            Notification: notification,
            Parallax: parallax,
            Slider: slider,
            SliderParallax: sliderParallax,
            Slideshow: slideshow,
            SlideshowParallax: sliderParallax,
            Sortable: sortable,
            Tooltip: tooltip,
            Upload: upload
        });

        // register components
        each(coreComponents, register);
        each(components, register);

        // core functionality
        UIkit.use(Core);

        boot(UIkit);

        function register(component, name) {
            UIkit.component(name, component);
        }

        return UIkit;

    })));
    });

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

/* Camera System — interpolasi halus menuju target per scene (spec §5) */
const Camera = {
  x: 0, y: 0, z: 0, scale: 1, rx: 0, ry: 0,
  _t: { x: 0, y: 0, z: 0, scale: 1, rx: 0, ry: 0 },
  _raf: null, _el: null,
  bind(el) { this._el = el; },
  to(target) { Object.assign(this._t, target); this._run(); },
  reset() { this.to({ x:0,y:0,z:0,scale:1,rx:0,ry:0 }); },
  _run() {
    cancelAnimationFrame(this._raf);
    const step = () => {
      const k = 0.08;
      for (const key of ['x','y','z','scale','rx','ry']) {
        this[key] += (this._t[key] - this[key]) * k;
      }
      if (this._el) {
        this._el.style.transform =
          'perspective(1100px) translate3d(' + this.x.toFixed(2) + 'px,' + this.y.toFixed(2) + 'px,' + this.z.toFixed(2) + 'px)' +
          ' rotateX(' + this.rx.toFixed(2) + 'deg) rotateY(' + this.ry.toFixed(2) + 'deg) scale(' + this.scale.toFixed(4) + ')';
      }
      const done = ['x','y','z','scale','rx','ry'].every(key => Math.abs(this._t[key] - this[key]) < .01);
      if (!done) this._raf = requestAnimationFrame(step);
    };
    this._raf = requestAnimationFrame(step);
  }
};

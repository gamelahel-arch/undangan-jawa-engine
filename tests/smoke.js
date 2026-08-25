
// --- minimal DOM/fetch mocks untuk smoke test ---
const els = {};
function el(id){ return els[id] || (els[id] = { style:{}, dataset:{}, classList:{add(){},toggle(){}}, textContent:'', appendChild(){}, addEventListener(){}, href:'' }); }
global.document = {
  documentElement:{style:{setProperty(){}, }, dataset:{}},
  body:{dataset:{}},
  querySelector: s => ({ style:{}, classList:{add(){},toggle(){}}, textContent:'', appendChild(){}, getBoundingClientRect(){return {top:0,bottom:0}} }),
  querySelectorAll: () => [],
  getElementById: el,
  createElement: () => ({ style:{ setProperty(){} }, classList:{add(){}}, append(){}, appendChild(){}, textContent:'', set src(v){}, dataset:{} }),
  addEventListener(){}
};
global.window = { scrollY: 0, addEventListener(){} };
global.addEventListener = ()=>{};
global.matchMedia = () => ({ matches:false });
global.navigator = {};
global.innerHeight = 800;
global.innerWidth = 400;
global.URLSearchParams = URLSearchParams;
global.location = { search:'' };
global.requestAnimationFrame = cb => setTimeout(cb,16);
global.cancelAnimationFrame = ()=>{};
global.fetch = async url => ({ json: async () => require('fs').existsSync(url) ? JSON.parse(require('fs').readFileSync(url)) : {} });
global.IntersectionObserver = class { observe(){} unobserve(){} disconnect(){} };

// load engine files in order
const fs = require('fs');
for (const f of ['../scenes/opening','theme','performance','parallax','motion','camera','animation','scene','interaction','renderer','init']) {
  require('vm').runInThisContext(fs.readFileSync('engine/'+f+'.js','utf8'),{filename:f+'.js'});
}
// run start
(async () => {
  await App.start();
  // Phase 2 assertions: modul baru load & state benar
  const assert = require('assert');
  assert.strictEqual(typeof MotionEngine.init, 'function', 'MotionEngine harus terdefinisi');
  assert.ok(Array.isArray(ParallaxManager.linked), 'ParallaxManager.linked harus array');
  console.log('SMOKE TEST PASS — App.start selesai tanpa error'); process.exit(0);
})().catch(e => { console.error('SMOKE TEST FAIL:', e.message); process.exit(1); });

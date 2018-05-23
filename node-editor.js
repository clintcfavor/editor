var numSocket = new D3NE.Socket('number', 'Number value', 'hint');
var multiInput = new D3NE.Input('Number', numSocket, true);

var componentNum = new D3NE.Component('', {
  builder(node) {
    var out1 = new D3NE.Output('', numSocket);
    var inp1 = new D3NE.Input('', numSocket);
    var numControl = new D3NE.Control('<input type="number">', (el, c) => {
      el.value = c.getData('num') || 1;

      function upd() {
        c.putData('num', parseFloat(el.value));
      }

      el.addEventListener('input', () => {
        upd();
        editor.eventListener.trigger('change');
      });
      el.addEventListener('mousedown', function(e) {
        e.stopPropagation();
      }); // prevent node movement when selecting text in the input field
      upd();
    });

    return node
      .addControl(numControl)
      .addInput(inp1)
      .addOutput(out1);
  },
  worker(node, inputs, outputs) {
    outputs[0] = node.data.num;
  }
});

var componentAdd = new D3NE.Component('', {
  builder(node) {
    var inp1 = new D3NE.Input('Number', numSocket, true);
    var inp2 = new D3NE.Input('Number', numSocket, true);
    var out = new D3NE.Output('', numSocket, true);

    var textControl = new D3NE.Control('<input type="text">');
    var numControl = new D3NE.Control('<input id="input-num" type="text">');

    return node
      .addInput(inp1)
      .addControl(textControl)
      .addControl(numControl)
      .addOutput(out);
  },
  worker(node, inputs, outputs) {
    var sum = inputs[0][0] + inputs[1][0];
    editor.nodes.find(n => n.id == node.id).controls[0].setValue(sum);
    outputs[0] = sum;
  }
});

var menu = new D3NE.ContextMenu({
  Values: {
    Value: componentNum,
    Action: function() {
      alert('ok');
    }
  },
  Add: componentAdd
});

var container = document.getElementById('nodeEditor');
var components = [componentNum, componentAdd];
var editor = new D3NE.NodeEditor('demo@0.1.0', container, components, menu);

//  editor.selectNode(tnode);

var engine = new D3NE.Engine('demo@0.1.0', components);

editor.eventListener.on('change', async function() {
  await engine.abort();
  await engine.process(editor.toJSON());

  var inputnum = document.getElementById('input-num');
  
  if (inputnum != null) {
    var cleave = new Cleave(inputnum, {
      delimiter: '-',
      blocks: [6, 4],
      uppercase: true
    });
  }
});

editor.view.zoomAt(editor.nodes);
editor.eventListener.trigger('change');
editor.view.resize();

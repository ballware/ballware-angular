/**
 * Custom snapshot serializer for DevExtreme components
 * Normalizes dynamic IDs and GUID-based attributes to make snapshots stable
 *
 * This serializer works on string output from other serializers (like ng-snapshot)
 * to preserve the component structure while normalizing GUIDs.
 */

const GUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

let idCounter = 0;
const idReplacementMap = new Map();

function resetIdCounter() {
  idCounter = 0;
  idReplacementMap.clear();
}

function normalizeGuidId(id) {
  if (!idReplacementMap.has(id)) {
    idReplacementMap.set(id, `normalized-id-${idCounter++}`);
  }
  return idReplacementMap.get(id);
}

module.exports = {
  test(val) {
    // Dieser Serializer arbeitet auf Strings, die von anderen Serializern erzeugt wurden
    if (typeof val === 'string') {
      GUID_PATTERN.lastIndex = 0;
      return GUID_PATTERN.test(val);
    }
    return false;
  },

  serialize(val, config, indentation, depth, refs, printer) {
    resetIdCounter();

    // val ist bereits ein String von vorherigen Serializern
    let result = val;

    // Ersetze alle GUID-Muster durch normalisierte IDs
    GUID_PATTERN.lastIndex = 0;
    result = result.replace(GUID_PATTERN, (match) => {
      return normalizeGuidId(match);
    });

    return result;
  }
};

function cloneElementWithAttributes(element) {
  if (!element) return element;

  // Use cloneNode(true) for deep clone
  const cloned = element.cloneNode(true);
  return cloned;
}


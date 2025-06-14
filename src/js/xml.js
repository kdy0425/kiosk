/******************************************
 name :  xml.js
 auth :  ELTOV
 date :  2020.11.08
 desc :  xml파싱처리
 *******************************************/
let gl_xml_conf = {
    url_data: "../xml/kiosk_contents.xml",
    url_route: "../xml/kiosk_route.xml",
    xml_data: new Object(),
    xml_route: new Object(),
}

//////////////////////////////////////////////////////////
// 리턴할 페이지 불러오기
async function setLoadDataContents() {
    gl_xml_conf.xml_data = await loadAndConvertXml(gl_xml_conf.url_data);
    gl_xml_conf.xml_route = await loadAndConvertXml(gl_xml_conf.url_route);
    console.log(gl_xml_conf.xml_data);
    console.log(gl_xml_conf.xml_route);
}

function simpleXmlToJson(node) {
  // element node
  if (node.nodeType === 1) {
    const obj = {};

    // 1) attributes
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes.item(i);
      obj[attr.nodeName] = attr.nodeValue;
    }

    // 2) 자식 분리
    const childElems = [];
    const childTexts = [];
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes.item(i);
      if (child.nodeType === 1) {
        childElems.push(child);
      } else if (
        (child.nodeType === 3 && child.nodeValue.trim() !== "") ||
        child.nodeType === 4
      ) {
        childTexts.push(child.nodeValue);
      }
    }

    // 3) 텍스트만 있는 경우: JSON인지 시도 후, 아니면 문자열 또는 {…value:text}
    if (childElems.length === 0 && childTexts.length > 0) {
      const text = childTexts.join("").trim();

      // JSON 형태이면 파싱
      try {
        const parsed = JSON.parse(text);
        return parsed;
      } catch (e) {
        // JSON이 아니면 그대로 처리
        return Object.keys(obj).length > 0
          ? { ...obj, value: text }
          : text;
      }
    }

    // 4) 자식 element 재귀
    childElems.forEach(child => {
      const key = child.nodeName;
      const value = simpleXmlToJson(child);
      if (obj[key] === undefined) {
        obj[key] = value;
      } else {
        if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
        obj[key].push(value);
      }
    });

    return obj;
  }

  // element가 아니면 빈 문자열
  return "";
}


async function loadAndConvertXml(filePath) {
  
  try {
    const response = await fetch(filePath);
    const text = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");
    const json = simpleXmlToJson(xmlDoc.documentElement);
    
    return json;
  } catch (error) {
    console.error("XML 파일을 불러오거나 변환하는 중 오류:", error);
  }
}

/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * The 'pre' function that is executed before the HTML is rendered
 * @param payload The current payload of processing pipeline
 * @param payload.content The content
 */

const toHAST = require('mdast-util-to-hast');
const toHTML = require('hast-util-to-html');

function wrapNodes(newparent, elems) {
  elems.forEach((el, index) => {
    newparent.appendChild(el.cloneNode(true));
    if (index == 0) {
      el.parentNode.replaceChild(newparent, el);
    } else {
      el.parentNode.removeChild(el);
    }
  });
}

function wrap(document, selector, classname) {
  const elems = document.querySelectorAll(selector);
  const div = document.createElement("div");
  div.className = classname;
  wrapNodes(div, elems);
}

function classify(document, selector, classname, level) {
  const elems = document.querySelectorAll(selector);
  elems.forEach((el) => {
    let l = level;
    while (l) {
      el = el.parentNode;
      l--;
    }
    el.className = classname;
  });
}

function pre(payload) {
  payload.content.meta.template = payload.content.meta.template ? payload.content.meta.template : 'default';

  const document = payload.content.document;

  /* workaround until sections in document are fixed */
  let currentCollection = [];
  let sections = []

  /* prepare wrapping */
  document.body.childNodes.forEach((child) => {
    if (child.tagName == "HR") {
      sections.push(currentCollection);
      currentCollection = [];
    } else {
      currentCollection.push(child);
    }
  });

  sections.push(currentCollection);

  /* replace sections */
  sections.forEach((el) => {
    wrapNodes(document.createElement("section"), el);
  })

  /* remove HRs */
  document.querySelectorAll("body>hr").forEach((el) => {
    el.parentNode.removeChild(el)
  });

  classify(document, "section", "copy");
  classify(document, "section>:first-child>img", "image", 2);

  /* header image? */
  if (document.querySelector("section:first-child p:first-child>img")) {
    classify(document, "section:first-child", "title");
    wrap(document, "section:first-child :nth-child(1n+2)", "header");
  }
}

module.exports.pre = pre;
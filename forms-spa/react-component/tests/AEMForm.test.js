import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {getVerifyObserver} from "./Utils";
import {AEMForm} from '../src/components/AEMForm';


describe('AEMForm ->', () => {

    const ROOT_NODE_CLASS_NAME = "route-node";

    let observer;
    let observerConfig = { attributes: true, subtree: true, childList: true };
    let rootNode;

    let sandbox = sinon.createSandbox();

    beforeEach(() => {
        rootNode = document.createElement('div');
        rootNode.className = ROOT_NODE_CLASS_NAME;
        document.body.appendChild(rootNode);
    });

    afterEach(() => {

        if (observer) {
            observer.disconnect();
        }

        if (rootNode) {
            document.body.removeChild(rootNode);
            rootNode = undefined;
        }

        sandbox.restore();
    });

    describe('instantiation ->', () => {
        it('should generate the expected DOM for valid form', (done) => {
            observer = getVerifyObserver(function (mutation) {
                return mutation.type === 'childList' && mutation.addedNodes && mutation.addedNodes.length > 0 && mutation.addedNodes[0].className === 'aemformcontainer';
            }, done);

            observer.observe(rootNode, observerConfig);

            ReactDOM.render(<BrowserRouter><AEMForm
                formPath='/path/to/form'
                formType='adaptiveDocument'
                icChannel='printChannel'
                isValidForm={true}
                /></BrowserRouter>, rootNode);

            expect(rootNode.querySelector('.aemformcontainer')).to.exist;
            expect(rootNode.querySelector('.adaptiveDocument')).to.exist;
        });
    });

    describe('instantiation invalid form ->', () => {
        it('should generate the expected DOM for invalid form', () => {
            ReactDOM.render(<BrowserRouter><AEMForm
                formPath='/path/to/form'
                formType='adaptiveForm'
                isValidForm={false}
                /></BrowserRouter>, rootNode);

            expect(rootNode.querySelector('.aemformcontainer')).to.exist;
            expect(rootNode.querySelector('.aemformcontainer').innerHTML).to.equal("<p>You need to select a valid form</p>");
        });
    });
});

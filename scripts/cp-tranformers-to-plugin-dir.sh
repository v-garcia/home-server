#!/bin/bash

chmod +x ./transformers/*

mkdir -p ~/.config/kustomize/plugin/my-home-server/v1/ingressdomaintransformer/
cp ./transformers/IngressDomainTransformer ~/.config/kustomize/plugin/my-home-server/v1/ingressdomaintransformer/
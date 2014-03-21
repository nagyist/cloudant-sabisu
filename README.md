[![Build Status](https://magnum.travis-ci.com/cloudant/sabisu.png?token=r6PdrwNFR1nUzFeEEiQ6&branch=master)](https://magnum.travis-ci.com/cloudant/sabisu)
sabisu
======

A sensu web ui powered by [Cloudant](https://cloudant.com)

Features
========

 * Full text search (based on [lucene](http://lucene.apache.org/))
 * Complex search, filtering, and sorting
 * Smart autocomplete to help you find what you're looking for
 * Statistical analysis of your search/query (faceting)
 * Real-time streaming updates to the event list and stats (non-polling)
 * Add custom attributes to your sensu events and make them searchable, indexed, and give them statistical context
 * Easy "drill down" by clicking on any client, check, status or even custom attributes to see more events like them
 * Silence with expiration timeout, unsilence on resolve, or never expire
 * Create views of your sensu environment and save, bookmark, and share them with your colleagues.

Demo
====

If you want to take sabisu for a test drive, jump over to the [demo](http://demo.sabisuapp.org/)

Screenshots
===========

![Dashboard](https://raw.githubusercontent.com/cloudant/sabisu/master/screenshots/example.png "dashboard")

Requirements
============

[Sensu](https://github.com/sensu/sensu) >= [0.12.1](https://github.com/sensu/sensu/blob/master/CHANGELOG.md#0121---2013-11-02)

Installation
============

For installation instruction, go [here](https://github.com/cloudant/sabisu/wiki/Installation) 

Development Environment
=======================

To setup sabisu for local development, 

1. first setup/install [RVM](https://rvm.io/) (or something like it, ie [rbenv](http://rbenv.org/)). Its a good idea to keep your dev environment separate from your system ruby.
2. clone the repo (`git clone git@github.com:cloudant/sabisu.git`)
3. Create a `.env` file to setup your environment variables (see [Environment Variables](https://github.com/cloudant/sabisu/wiki/Installation#environment-variables)).
4. Source the file (`source .env`)
5. Next run `bundle install` to install all gem dependencies
6. To startup sabisu locally, run `foreman start`
7. In your browser, visit [localhost:8080](http://localhost:8080)
